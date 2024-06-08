import { createMessage, getMessages } from "../controllers/message.js";

export default (router) => {
  router.post("/create-message", createMessage);
  router.get("/messages/:chatId", getMessages);
};
