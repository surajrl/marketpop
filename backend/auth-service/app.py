from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import datetime
from functools import wraps
from sqlalchemy.orm import mapped_column
from sqlalchemy import Integer, String, DateTime
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from flask_marshmallow import Marshmallow
import os

JWT_PRIVATE_KEY = open("jwt-private-key").read()
JWT_PUBLIC_KEY = open("jwt-public-key.pub").read()

MYSQL_ROOT_PASSWORD = os.getenv("MYSQL_ROOT_PASSWORD")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")
MYSQL_PORT = os.getenv("MYSQL_PORT")
MYSQL_HOST = os.getenv("MYSQL_HOST")

# Create and configure the app and database.
app = Flask(__name__)
SQLALCHEMY_DATABASE_URI = (
    f"mysql://root:{MYSQL_ROOT_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
    if all([MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, MYSQL_PORT, MYSQL_HOST])
    else "sqlite:///db.sqlite3"
)

app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
CORS(app=app)
db = SQLAlchemy(app=app)


# Models.
class User(db.Model):
    id = mapped_column(Integer, primary_key=True)
    username = mapped_column(String(1), unique=True, nullable=False)
    email = mapped_column(String(1), unique=True, nullable=False)
    hashed_password = mapped_column(String(1), nullable=False)
    created_at = mapped_column(DateTime, nullable=False)
    updated_at = mapped_column(DateTime)


# Create the db if using SQLite.
if SQLALCHEMY_DATABASE_URI == "sqlite:///db.sqlite3":
    with app.app_context():
        db.create_all()


# TODO: See how to implement this. Remove for now.
# class TokenBlocklist(db.Model):
#     id = mapped_column(Integer, primary_key=True)
#     token = mapped_column(String, nullable=False)
#     created_at = mapped_column(DateTime, nullable=False)


# Schemas.
ma = Marshmallow(app)


class UserSchema(ma.Schema):
    class Meta:
        # Fields to expose.
        fields = ("id", "username", "email", "created_at", "updated_at")


user_schema = UserSchema()
users_schema = UserSchema(many=True)


# Helpers.
def token_required(f):
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

        # # TODO: Check if the token has been revoked.
        # if TokenBlocklist.query.filter_by(token=encoded_jwt).first() is not None:
        #     return jsonify(message="Unauthorized. Token has been revoked."), 401

        return f(decoded_jwt, *args, **kwargs)

    return decorator


# Routes.
@app.route("/auth/signup", methods=["POST"])
def signup():
    username = request.json.get("username")
    password = request.json.get("password")
    email = request.json.get("email")

    # Check empty credentials.
    if not username or username.strip() == "":
        return jsonify(message=f"Username cannot be empty."), 400
    if not password or password.strip() == "":
        return jsonify(message=f"Password cannot be empty."), 400
    if not email or email.strip() == "":
        return jsonify(message=f"Email cannot be empty."), 400

    # Check username or email already exists.
    username_exists = User.query.filter_by(username=username).first()
    email_exists = User.query.filter_by(email=email).first()
    if username_exists:
        return jsonify(message="The username is already taken."), 400
    if email_exists:
        return jsonify(message="The email is already in use."), 400

    # Hash the password.
    hashed_password = generate_password_hash(password=password, method="pbkdf2:sha256")

    # Create the user and add it to the db.
    new_user = User(
        username=username,
        hashed_password=hashed_password,
        email=email,
        created_at=datetime.datetime.now(datetime.UTC),
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify(message="User created successfully."), 200


@app.route("/auth/login", methods=["POST"])
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    # Find user on db.
    get_user = User.query.filter_by(username=username).first()

    # Check user exists.
    if get_user is None:
        return jsonify(message="User not found."), 404

    # Check password is correct.
    if not check_password_hash(pwhash=get_user.hashed_password, password=password):
        return jsonify(message="Wrong password."), 401

    # Generate JWT.
    expiration_time = datetime.datetime.now() + datetime.timedelta(days=1)
    encoded_jwt = jwt.encode(
        payload={
            "user": user_schema.dump(get_user),
            "expires": expiration_time.strftime(
                "%Y-%m-%dT%H:%M:%S.%f"
            ),  # Expiration time (UTC).
            "exp": expiration_time,  # Expiration time (epoch).
            "iat": datetime.datetime.now(datetime.UTC),  # Issued at.
        },
        key=JWT_PRIVATE_KEY,
        algorithm="RS256",
    )

    return jsonify(token=encoded_jwt), 200


@app.route("/auth/logout", methods=["POST"])
def logout():
    if "Authorization" not in request.headers:
        return jsonify(message="Missing Authorization header."), 401

    authorization_header = request.headers["Authorization"]

    if not authorization_header:
        return jsonify(message="Missing credentials."), 401

    # Expected Authorization header format: Bearer <token>
    encoded_jwt = authorization_header.split(" ")[1]
    if not encoded_jwt or encoded_jwt == "undefined":
        return jsonify(message="Missing credentials."), 401

    # # Add token to the TokenBlockist db.
    # db.session.add(
    #     TokenBlocklist(
    #         token=encoded_jwt, created_at=datetime.datetime.now(datetime.UTC)
    #     )
    # )
    # db.session.commit()

    return jsonify(message="Token revoked."), 200


@app.route("/auth/users", methods=["GET"])
@token_required
def get_users(decoded_jwt):
    users = db.session.execute(db.select(User)).scalars()
    return jsonify(users=users_schema.dump(users)), 200


@app.route("/auth/user", methods=["GET"])
@token_required
def get_user(decoded_jwt):
    user = User.query.filter_by(id=decoded_jwt["user"]["id"]).first()

    if not user:
        return jsonify(message="User not found."), 404

    return jsonify(user=user_schema.dump(user)), 200


@app.route("/auth/user/<int:user_id>", methods=["GET"])
@token_required
def get_user_by_id(decoded_jwt, user_id):
    user = User.query.filter_by(id=user_id).first()

    if not user:
        return jsonify(message="User not found."), 404

    return jsonify(user=user_schema.dump(user)), 200


@app.route("/auth/certs", methods=["GET"])
def certs():
    # TODO: Return a list of public keys for checking JWT signature. This will be used by other services, that will cache the keys themselves.
    return None


# Run the server.
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
