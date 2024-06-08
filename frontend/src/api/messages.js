"use server";

import { MESSAGE_URL } from "./constants";
import axios from "axios";

const apiClient = axios.create({
  baseURL: MESSAGE_URL,
  withCredentials: true,
});

export async function createOrGetChat(userIdOne, userIdTwo) {
  const data = { userIdOne, userIdTwo };
  try {
    const response = await apiClient.post("/chat", data);
    return response.data;
  } catch (error) {
    console.error(`Message service error: ${error.message}`);
    return null;
  }
}

export async function getUserChats(userId) {
  try {
    const response = await apiClient.get(`/chats/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Message service error: ${error.message}`);
    return [];
  }
}

export async function getChatMessages(chatId) {
  try {
    const response = await apiClient.get(`/messages/${chatId}`);
    return response.data;
  } catch (error) {
    console.error(`Message service error: ${error.message}`);
    return [];
  }
}

export async function sendMessage(chatId, senderId, message) {
  const data = {
    chatId: chatId,
    senderId: Number(senderId),
    message: message,
  };

  try {
    const response = await apiClient.post(
      `${MESSAGE_URL}/create-message`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Message service error: ${error.message}`);
    return null;
  }
}
