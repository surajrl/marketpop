from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import Integer, String, DateTime, select
from sqlalchemy.orm import mapped_column
from functools import wraps
import datetime
import requests
import jwt
import os

JWT_PUBLIC_KEY = open("jwt-public-key.pub").read()

MYSQL_ROOT_PASSWORD = os.getenv("MYSQL_ROOT_PASSWORD")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")
MYSQL_PORT = os.getenv("MYSQL_PORT")
MYSQL_HOST = os.getenv("MYSQL_HOST")

# Create and configure the app and database.
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql://root:{MYSQL_ROOT_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
)
CORS(app=app)
db = SQLAlchemy(app=app)


# Models.
class Cart(db.Model):
    id = mapped_column(Integer, primary_key=True)
    user_id = mapped_column(Integer, unique=True, nullable=False)
    created_at = mapped_column(DateTime, nullable=False)


class CartItem(db.Model):
    id = mapped_column(Integer, primary_key=True)
    cart_id = mapped_column(Integer, nullable=False)
    item_id = mapped_column(String, nullable=False)


# Schemas.
ma = Marshmallow()


class CartSchema(ma.Schema):
    class Meta:
        # Fields to expose.
        fields = ("id", "user_id", "created_at")


class CartItemSchema(ma.Schema):
    class Meta:
        # Fields to expose.
        fields = ("id", "cart_id", "item_id")


cart_schema = CartSchema()
cart_schema = CartSchema(many=True)

cart_items_schema = CartItemSchema()
cart_items_schema = CartItemSchema(many=True)


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


# Routes.
@app.route("/cart/add/<item_id>", methods=["POST"])
@verify_token
def add(decoded_jwt, item_id):
    user = decoded_jwt["user"]
    cart = Cart.query.filter_by(user_id=user["id"]).first()

    # Create a new cart if the user doesn't have one.
    if not cart:
        cart = Cart(user_id=user["id"], created_at=datetime.datetime.now(datetime.UTC))
        db.session.add(cart)
        db.session.flush()

    # Check the item is already in the cart.
    if CartItem.query.filter_by(cart_id=cart.id, item_id=item_id).first():
        return jsonify(message="Item already in cart."), 200

    # Check the item exists.
    res = requests.get(f"http://item-service-svc:8001/item/{item_id}")
    if res.status_code == 404:
        return jsonify(message="Item not found."), 404
    item = res.json()["item"]

    # Check the item is available.
    if item["status"]["available"] == False:
        return jsonify(message="Item not available."), 400

    new_cart_item = CartItem(cart_id=cart.id, item_id=item_id)
    db.session.add(new_cart_item)

    db.session.commit()

    return jsonify(message="Item added to cart."), 200


@app.route("/cart/remove/<item_id>", methods=["POST"])
@verify_token
def remove(decoded_jwt, item_id):
    user = decoded_jwt["user"]
    cart = Cart.query.filter_by(user_id=user["id"]).first()

    if not cart:
        return jsonify(message="Cart not found."), 404

    # Get the item from the cart.
    cart_item = CartItem.query.filter_by(cart_id=cart.id, item_id=item_id).first()
    if not cart_item:
        return jsonify(message="Item not found in cart."), 404

    # Remove the item from the cart.
    db.session.delete(cart_item)
    db.session.commit()

    return jsonify(message="Item removed from cart."), 200


@app.route("/cart/items", methods=["GET"])
@verify_token
def get_cart_items(decoded_jwt):
    user = decoded_jwt["user"]
    cart = Cart.query.filter_by(user_id=user["id"]).first()

    # Return an empty cart if the user doesn't have one.
    if not cart:
        return jsonify(cart_items=[]), 200

    # Find the cart items associated to this cart.
    cart_items = db.session.execute(
        select(CartItem).where(CartItem.cart_id == cart.id)
    ).scalars()

    return jsonify(cart_items=cart_items_schema.dump(cart_items)), 200


# Delete the cart of a user.
@app.route("/cart", methods=["DELETE"])
@verify_token
def delete_cart(decoded_jwt):
    user = decoded_jwt["user"]
    cart = Cart.query.filter_by(user_id=user["id"]).first()

    db.session.delete(cart)
    db.session.commit()

    return jsonify(message="Cart deleted."), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8002, debug=True)
