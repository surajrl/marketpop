"use server";

import { AuthRequiredError } from "@/exceptions";
import { ORDER_URL } from "./constants";
import { cookies } from "next/headers";

export async function createOrder(items) {
  const jwt = cookies().get("session")?.value;
  if (!jwt) throw new AuthRequiredError();

  const res = await fetch(`${ORDER_URL}/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      items: items,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.log(data.message);
    throw new Error();
  }

  return data.url;
}

export async function getOrdersByUserId(userId) {
  const jwt = cookies().get("session")?.value;
  if (!jwt) throw new AuthRequiredError();

  const res = await fetch(`${ORDER_URL}?user=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.log(data.message);
    throw new Error();
  }

  return data.orders;
}

export async function getOrderById(orderId) {
  const jwt = cookies().get("session")?.value;
  if (!jwt) throw new AuthRequiredError();

  const res = await fetch(`${ORDER_URL}/${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.log(data.message);
    throw new Error();
  }

  return data.order;
}

export async function getOrderItemsById(orderId) {
  const jwt = cookies().get("session")?.value;
  if (!jwt) throw new AuthRequiredError();

  const res = await fetch(`${ORDER_URL}/${orderId}/items`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.log(data.message);
    throw new Error();
  }

  return data.order_items;
}

export async function getOrderPaymentStatus() {
  const jwt = cookies().get("session")?.value;
  if (!jwt) throw new AuthRequiredError();

  const res = await fetch(`${ORDER_URL}/payment-status`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.log(data.message);
    throw new Error();
  }

  return data.payment_status;
}
