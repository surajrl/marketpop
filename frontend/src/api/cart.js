"use server";

import { AuthRequiredError } from "@/exceptions";
import { CART_URL } from "./constants";
import { cookies } from "next/headers";

export async function getCartItems() {
  const jwt = cookies().get("session")?.value;
  if (!jwt) return [];

  let res;
  try {
    res = await fetch(`${CART_URL}/items`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });
  } catch (error) {
    console.error(`Cart service error: ${error.message}`);
    return [];
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    console.log(err.message);
    return [];
  }

  if (!res.ok) {
    console.log(data.message);
    throw new Error();
  }

  return data.cart_items;
}

export async function addToCart(itemId) {
  const jwt = cookies().get("session")?.value;
  if (!jwt) throw new AuthRequiredError();

  let res;
  try {
    res = await fetch(`${CART_URL}/add/${itemId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });
  } catch (err) {
    console.error(`Cart service backend error: ${err}`);
    throw new Error();
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    console.log(err.message);
    throw new Error();
  }

  if (!res.ok) {
    console.log(data.message);
    throw new Error();
  }

  return data.message;
}

export async function removeFromCart(itemId) {
  const jwt = cookies().get("session")?.value;
  if (!jwt) throw new AuthRequiredError();

  let res;
  try {
    res = await fetch(`${CART_URL}/remove/${itemId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });
  } catch (err) {
    console.error(`Cart service backend error: ${err}`);
    throw new Error();
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    console.log(err.message);
    throw new Error();
  }

  if (!res.ok) {
    console.log(data.message);
    throw new Error();
  }

  return data.message;
}
