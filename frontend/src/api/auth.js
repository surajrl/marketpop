"use server";

import { cookies } from "next/headers";
import { AUTH_URL } from "./constants";

export async function login(username, password) {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`Auth service error: ${data.message}`);
    throw new Error(data.message);
  }

  // Extract JWT payload to get the expiration time
  const session = await data.token;
  const [_, payloadBase64] = session.split(".");
  const payload = JSON.parse(atob(payloadBase64));

  // Save the session/JWT in a cookie
  cookies().set("session", session, {
    httpOnly: true,
    expires: new Date(payload.expires),
  });
}

export async function logout() {
  const jwt = cookies().get("session")?.value;
  if (!jwt) return;

  // Remove the session/JWT from the cookies
  cookies().set("session", "", { expires: new Date(0) });
}

export async function signup(username, email, password) {
  try {
    const response = await fetch(`${AUTH_URL}/signup`, {
      method: "POST",
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
  } catch (error) {
    console.error(`Auth service error: ${error.message}`);
    throw new Error(error.message);
  }
}

export async function getUser() {
  try {
    const jwt = cookies().get("session")?.value;

    const response = await fetch(`${AUTH_URL}/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data.user;
  } catch (error) {
    console.error(`Auth service error: ${error.message}`);
    return null;
  }
}

export async function getUserById(userId) {
  try {
    const jwt = cookies().get("session")?.value;

    const response = await fetch(`${AUTH_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data.user;
  } catch (error) {
    console.error(`Auth service error: ${error.message}`);
    return null;
  }
}

export async function getAllUsers() {
  try {
    const jwt = cookies().get("session")?.value;

    const response = await fetch(`${AUTH_URL}/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data.users;
  } catch (error) {
    console.error(`Auth service error: ${error.message}`);
    return [];
  }
}
