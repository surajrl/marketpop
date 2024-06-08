export const AUTH_URL =
  process.env.NODE_ENV === "production"
    ? "http://auth-service-svc:8000/auth"
    : "http://localhost:8000/auth";

export const ITEM_URL =
  process.env.NODE_ENV === "production"
    ? "http://item-service-svc:8001/item"
    : "http://localhost:8001/item";

export const CART_URL =
  process.env.NODE_ENV === "production"
    ? "http://cart-service-svc:8002/cart"
    : "http://localhost:8002/cart";

export const ORDER_URL =
  process.env.NODE_ENV === "production"
    ? "http://order-service-svc:8003/order"
    : "http://localhost:8003/order";

export const MESSAGE_URL =
  process.env.NODE_ENV === "production"
    ? "http://message-service-svc:4000/message"
    : "http://localhost:4000/message";

export const SOCKET_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "http://34.160.87.243:80"
    : "http://localhost:4000";
