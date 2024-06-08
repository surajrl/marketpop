"use server";

import { AuthRequiredError } from "@/exceptions";
import { ITEM_URL } from "./constants";
import { cookies } from "next/headers";

export async function createItem(formData) {
  try {
    const jwt = cookies().get("session")?.value;
    if (!jwt) throw new AuthRequiredError();

    await fetch(`${ITEM_URL}/`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
  } catch (error) {
    console.error(`Item service error: ${error.message}`);
    throw new Error(error.message);
  }
}

export async function getItemById(itemId) {
  try {
    const response = await fetch(`${ITEM_URL}/${itemId}`, {
      method: "GET",
      cache: "no-cache",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data.item;
  } catch (error) {
    console.error(`Item service error: ${error.message}`);
    return null;
  }
}

export async function getItems(searchCriteria) {
  try {
    const response = await fetch(`${ITEM_URL}/items?search=${searchCriteria}`, {
      method: "GET",
      cache: "no-cache",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data.items;
  } catch (error) {
    console.error(`Item service error: ${error.message}`);
    return [];
  }
}

export async function deleteItem(itemId) {
  try {
    const jwt = cookies().get("session")?.value;
    if (!jwt) throw new AuthRequiredError();

    const response = await fetch(`${ITEM_URL}/${itemId}`, {
      method: "DELETE",
      cache: "no-cache",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
  } catch (error) {
    console.error(`Item service error: ${error.message}`);
    throw new Error(error.message);
  }
}

export async function getAvailableItemsByUserId(userId) {
  const availableItems = await getAvailableItems();
  return availableItems.filter((item) => item.user_id === userId);
}

export async function getSoldItemsByUserId(userId) {
  const soldItems = await getSoldItems();
  return soldItems.filter((item) => item.user_id === userId);
}

export async function getAvailableItems() {
  return await getItems("available");
}

export async function getPendingItems() {
  return await getItems("pending");
}

export async function getSoldItems() {
  return await getItems("sold");
}
