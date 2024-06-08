import { getUserChats, createOrGetChat } from "../controllers/chat.js";

export default (router) => {
  router.post("/chat", createOrGetChat);
  router.get("/chats/:userId", getUserChats);
};
