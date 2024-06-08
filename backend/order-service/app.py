from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy.orm import mapped_column
import enum
from sqlalchemy import Integer, DateTime, String, select, create_engine
from functools import wraps
import stripe
import jwt
from kafka import KafkaProducer
import datetime
import json
import os
import logging
import sys
import requests

JWT_PUBLIC_KEY = open("jwt-public-key.pub").read()

STRIPE_API_KEY_TESTMODE = os.getenv("STRIPE_API_KEY_TESTMODE")
STRIPE_API_KEY_LIVEMODE = os.getenv("STRIPE_API_KEY_LIVEMODE")
STRIPE_ENDPOINT_SECRET = os.getenv("STRIPE_ENDPOINT_SECRET")

FRONTEND_URL = os.getenv("FRONTEND_URL")

MYSQL_ROOT_PASSWORD = os.getenv("MYSQL_ROOT_PASSWORD")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")
MYSQL_PORT = os.getenv("MYSQL_PORT")
MYSQL_HOST = os.getenv("MYSQL_HOST")

# Stripe.
stripe.api_key = STRIPE_API_KEY_TESTMODE


# Create and configure the app and database.
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql://root:{MYSQL_ROOT_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
)
app.logger.setLevel(logging.INFO)
CORS(app=app)
db = SQLAlchemy(app=app)


# Enums.
class OrderStatusEnum(enum.Enum):
    STARTED = 1
    PLACED = 2
    DELIVERED = 3
    CANCELLED = 4


# Models.
class Order(db.Model):
    id = mapped_column(Integer, primary_key=True)
    user_id = mapped_column(Integer, unique=True, nullable=False)
    status = mapped_column(Integer, nullable=False)
    created_at = mapped_column(DateTime, nullable=False)


class OrderItem(db.Model):
    id = mapped_column(Integer, primary_key=True)
    order_id = mapped_column(Integer, nullable=False)
    item_id = mapped_column(String, nullable=False)


# Schemas.
ma = Marshmallow(app)


class OrderSchema(ma.Schema):
    class Meta:
        # Fields to expose.
        fields = ("id", "user_id", "status", "created_at")


class OrderItemSchema(ma.Schema):
    class Meta:
        # Fields to expose.
        fields = ("id", "order_id", "item_id")


order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)

order_item_schema = OrderItemSchema()
order_items_schema = OrderItemSchema(many=True)


# Helpers.
def verify_token(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        if "Authorization" not in request.headers:
            return jsonify(message="Missing Authorization header."), 401

        authorization_header = request.headers["Authorization"]

        if not authorization_header:
            return jsonify(message="Missing credentials."), 401

        # Expected Authorization header format: Bearer <token>
        try:
            encoded_jwt = authorization_header.split(" ")[1]
            if not encoded_jwt or encoded_jwt == "undefined":
                return jsonify(message="Missing credentials."), 401
        except Exception:
            return jsonify(message="Missing credentials."), 401

        try:
            decoded_jwt = jwt.decode(
                jwt=encoded_jwt, key=JWT_PUBLIC_KEY, algorithms=["RS256"]
            )
        except Exception:
            return jsonify(message="Unauthorized. Token has expired."), 401

        # TODO: Check if the token has been revoked.

        return f(decoded_jwt, *args, **kwargs)

    return decorator


def gbp_to_cents(gbp):
    return int(gbp * 100)


def map_order_status_to_integer(status):
    map = {
        "started": OrderStatusEnum.STARTED.value,
        "placed": OrderStatusEnum.PLACED.value,
        "delivered": OrderStatusEnum.DELIVERED.value,
        "cancelled": OrderStatusEnum.CANCELLED.value,
    }
    return map.get(status.lower(), None)


# Routes.
@app.route("/order/health", methods=["GET"])
def health():
    return "Health check OK!"


@app.route("/order/create-checkout-session", methods=["POST"])
@verify_token
def create_checkout_session(decoded_jwt):
    app.logger.info(f"Creating checkout session")
    user = decoded_jwt["user"]
    app.logger.info(user)

    # Create new order.
    new_order = Order(
        user_id=user["id"],
        status=OrderStatusEnum.STARTED.value,
        created_at=datetime.datetime.now(datetime.UTC),
    )
    db.session.add(new_order)
    db.session.flush()

    line_items = []

    items = request.json.get("items")
    item_ids = [item["_id"]["$oid"] for item in items]

    for item_id in item_ids:
        # Check the items exist.
        res = requests.get(f"http://item-service-svc:8001/item/{item_id}")
        if res.status_code == 404 or res.json()["item"]["status"]["available"] == False:
            error_msg = "One of the items is not available."
            app.logger.error(error_msg)
            return jsonify(message=error_msg), 404

        item = res.json()["item"]

        # Create the order item.
        new_order_item = OrderItem(
            order_id=new_order.id,
            item_id=item["_id"]["$oid"],
        )
        db.session.add(new_order_item)
        db.session.flush()

        # Create the line item.
        line_items.append(
            {
                "price_data": {
                    "currency": "gbp",
                    "product_data": {
                        "name": item["title"],
                        "description": item["description"],
                        "metadata": {"item_id": item["_id"]["$oid"]},
                    },
                    "unit_amount": gbp_to_cents(item["price"]),
                },
                "quantity": 1,
            }
        )

    # Create Stripe checkout session.
    try:
        checkout_session = stripe.checkout.Session.create(
            mode="payment",
            line_items=line_items,
            success_url=f"{FRONTEND_URL}/thank-you?orderId={new_order.id}",
            cancel_url=f"{FRONTEND_URL}/cart",
            metadata={"user_id": user["id"], "order_id": new_order.id},
        )
    except stripe.error.StripeError as e:
        return jsonify(message=str(e)), 400

    # Delete the cart of the user.
    try:
        req = requests.delete(
            "http://cart-service-svc:8002/cart", headers=request.headers
        )
    except requests.exceptions.RequestException as err:
        app.logger.error(err)
        return jsonify(message=str(err)), 500
    if req.status_code != 200:
        app.logger.error("Cart delete error")
        return jsonify(message="Cart delete error."), req.status_code

    # Commit to database once the checkout session has been successful.
    db.session.commit()

    return jsonify(url=checkout_session.url), 200


@app.route("/order/webhook", methods=["POST"])
def webhook():
    event = None
    payload = request.data.decode("utf-8")
    sig_header = request.headers.get("Stripe_Signature", None)

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_ENDPOINT_SECRET
        )
    except ValueError as e:
        return "Invalid payload", 400
    except stripe.error.SignatureVerificationError as e:
        return "Invalid signature", 400

    # Handle the event.
    if event["type"] == "checkout.session.completed":
        checkout_session = event["data"]["object"]

        # Update order status to 'placed'.
        order = Order.query.filter_by(
            id=checkout_session["metadata"]["order_id"]
        ).first()
        order.status = OrderStatusEnum.PLACED.value
        db.session.commit()

        # Update item status to 'sold'.
        order_items = OrderItem.query.filter_by(order_id=order.id).all()
        item_ids = [order_item.item_id for order_item in order_items]
        for item_id in item_ids:
            try:
                req = requests.put(
                    f"http://item-service-svc:8001/item/{item_id}?status=sold"
                )
            except requests.exceptions.RequestException as err:
                app.logger.error(err)
                return jsonify(message=str(err)), 500
            if req.status_code != 200:
                app.logger.error("Item update error")
                return jsonify(message="Item update error."), req.status_code

        # Produce Kafka topic.
        producer = KafkaProducer(
            bootstrap_servers="kafka-svc:9093",
            value_serializer=lambda m: json.dumps(m).encode("ascii"),
        )
        producer.send("order-placed", {"item_id": item_ids})
        producer.flush()
    else:
        return "Unexpected event type", 400

    return "", 200


# Get the order by ID.
@app.route("/order/<int:order_id>", methods=["GET"])
@verify_token
def get_order(decoded_jwt, order_id):
    user = decoded_jwt["user"]
    order = Order.query.filter_by(id=order_id).first()

    # Check if the order belongs to the user.
    if order.user_id != user["id"]:
        return jsonify(message="Unauthorized."), 401

    return jsonify(order=order_schema.dump(order)), 200


# Get an order by user ID.
@app.route("/order", methods=["GET"])
@verify_token
def get_orders_by_user_id(decoded_jwt):
    user = decoded_jwt["user"]
    app.logger.info(user)

    user_id = request.args.get("user")
    app.logger.info(user_id)

    # Check if the authorization corresponds to the user.
    if str(user["id"]) != user_id:
        app.logger.error("Unauthorized")
        return jsonify(message="Unauthorized."), 401

    orders = db.session.execute(select(Order).where(Order.user_id == user_id)).scalars()
    orders = orders_schema.dump(orders)

    app.logger.info(orders)
    return jsonify(orders=orders), 200


# Get all the order items of an order.
@app.route("/order/<int:order_id>/items", methods=["GET"])
@verify_token
def get_order_items(decoded_jwt, order_id):
    user = decoded_jwt["user"]
    order = Order.query.filter_by(id=order_id).first()

    # Check if the order belongs to the user.
    if order.user_id != user["id"]:
        return jsonify(message="Unauthorized."), 401

    order_items = db.session.execute(
        select(OrderItem).where(OrderItem.order_id == order.id)
    ).scalars()

    return jsonify(order_items=order_items_schema.dump(order_items)), 200


@app.route("/order/payment-status", methods=["GET"])
@verify_token
def payment_status(decoded_jwt):
    user = decoded_jwt["user"]
    order = Order.query.filter_by(user_id=user["id"]).first()

    app.logger.info(order.status)

    return jsonify(payment_status=order.status == OrderStatusEnum.PLACED.value), 200


# Run the server.
if __name__ == "__main__":
    sh = logging.StreamHandler(sys.stdout)
    sh.setLevel(logging.INFO)
    fmt = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    app.run(host="0.0.0.0", port=8003, debug=True)
