import { Router } from "express";
import chat from "./chat.js";
import message from "./message.js";

const router = Router();

export default () => {
  chat(router);
  message(router);
  router.get("/health", (req, res) => {
    res.send("Health check OK!");
  });
  return router;
};
