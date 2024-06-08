from flask import Flask, request, jsonify
from flask_cors import CORS
import ast
import datetime
from bson.objectid import ObjectId
from bson import json_util
import uuid
from pymongo import MongoClient
from functools import wraps
import jwt
import boto3
import logging
import sys
import os
import json

JWT_PUBLIC_KEY = open("jwt-public-key.pub").read()

AWS_ACCESS_KEY_ID = "AKIAU6GDWQHGPCFACONM"
AWS_SECRET_ACCESS_KEY = "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"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

MONGODB_USER = os.getenv("MONGODB_USER", "root")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD", "root")
MONGODB_PORT = os.getenv("MONGODB_PORT", "27017")
MONGODB_HOST = os.getenv("MONGODB_HOST", "localhost")

# Create and configure the app and database.
app = Flask(__name__)
client = MongoClient(
    f"mongodb://{MONGODB_USER}:{MONGODB_PASSWORD}@{MONGODB_HOST}:{MONGODB_PORT}/"
)
app.logger.setLevel(logging.INFO)
CORS(app=app)
db = client["item_db"]
item_collection = db["item"]


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


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# Routes.
@app.route("/item/items", methods=["GET"])
def get_items():
    app.logger.info("GET /item/items")

    search_criteria = request.args.get("search")
    app.logger.info(search_criteria)

    if search_criteria == "available":
        items = item_collection.find({"status.available": True})
    elif search_criteria == "onhold":
        items = item_collection.find({"status.onhold": True})
    elif search_criteria == "sold":
        items = item_collection.find({"status.sold": True})
    else:
        items = item_collection.find()

    items = json.loads(json_util.dumps(items))

    app.logger.info("Fetched %s items.", len(items))
    return jsonify(items=items), 200


@app.route("/item/<item_id>", methods=["GET"])
def get_item(item_id):
    app.logger.info("GET /item/%s", item_id)

    item = item_collection.find_one({"_id": ObjectId(item_id)})

    if not item:
        app.logger.error("Item not found.")
        return jsonify(message="Item not found."), 404

    item = json.loads(json_util.dumps(item))

    app.logger.info(item)
    return jsonify(item=item), 200


@app.route("/item/", methods=["POST"])
@verify_token
def create_item(decoded_jwt):
    app.logger.info("POST /item")

    try:
        user = decoded_jwt["user"]
        title = request.form.get("title")
        description = request.form.get("description")
        price = request.form.get("price")
        image_file = request.files["image"]
    except:
        app.logger.error("Invalid request.")
        return jsonify(message="Invalid request."), 400

    if not allowed_file(image_file.filename):
        app.logger.error("Invalid image type.")
        return jsonify(message="Invalid image type."), 400

    # Upload image to S3.
    new_image_filename = (
        uuid.uuid4().hex + "." + image_file.filename.rsplit(".", 1)[1].lower()
    )
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )
    try:
        s3_client.upload_fileobj(
            image_file,
            "item-image-storage",
            new_image_filename,
            ExtraArgs={"ACL": "public-read"},
        )
    except Exception as e:
        app.logger.error(str(e))
        return jsonify(message=str(e)), 400

    image_url = f"https://item-image-storage.s3.amazonaws.com/{new_image_filename}"

    # Create item and insert into database.
    new_item = {
        "user_id": user["id"],
        "status": {
            "available": True,
            "onhold": False,
            "sold": False,
        },
        "title": title,
        "description": description,
        "price": round(float(price), 2),
        "image_url": image_url,
        "created_at": datetime.datetime.now(datetime.UTC),
    }
    item_collection.insert_one(new_item)

    app.logger.info(new_item)

    return jsonify(message="Item created successfully."), 200


@app.route("/item/<item_id>", methods=["PUT"])
def update_item(item_id):
    app.logger.info("PUT /item/%s", item_id)

    # Check the item exists.
    item = item_collection.find_one({"_id": ObjectId(item_id)})
    if not item:
        app.logger.error("Item not found.")
        return jsonify(message="Item not found."), 404

    # Check if the status is being updated.
    status = request.args.get("status", None)
    app.logger.info(status)
    if status is not None:
        item_collection.update_one(
            {"_id": ObjectId(item_id)},
            {
                "$set": {
                    "status": {
                        "available": status == "available",
                        "onhold": status == "onhold",
                        "sold": status == "sold",
                    }
                }
            },
        )

        app.logger.info("Item status updated successfully.")
        return jsonify(message="Item status updated successfully."), 200

    # Update the item.
    body = ast.literal_eval(json.dumps(request.get_json()))
    records_updated = item_collection.update_one({"_id": ObjectId(item_id)}, body)
    app.logger.info(body)

    if records_updated.modified_count > 0:
        app.logger.info("Item updated successfully.")
        return jsonify(message="Item updated successfully."), 200

    app.logger.error("Error updating item.")
    return jsonify(message="Error updating item."), 400


@app.route("/item/<item_id>", methods=["DELETE"])
@verify_token
def delete_item(decoded_jwt, item_id):
    app.logger.info("DELETE /item/%s", item_id)

    user = decoded_jwt["user"]
    item = item_collection.find_one({"_id": ObjectId(item_id)})

    if not item:
        app.logger.error("Item not found.")
        return jsonify(message="Item not found."), 404

    if item["user_id"] != user["id"]:
        app.logger.error("Unauthorized. You are not the owner of this item.")
        return jsonify(message="Unauthorized. You are not the owner of this item."), 401

    deleted_item = item_collection.delete_one({"_id": ObjectId(item_id)})

    if deleted_item.deleted_count > 0:
        app.logger.info("Item deleted successfully.")
        return jsonify(message="Item deleted successfully."), 200

    app.logger.error("Error deleting item.")
    return jsonify(message="Error deleting item."), 400


if __name__ == "__main__":
    sh = logging.StreamHandler(sys.stdout)
    sh.setLevel(logging.INFO)
    fmt = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    app.run(host="0.0.0.0", port=8001, debug=True)
