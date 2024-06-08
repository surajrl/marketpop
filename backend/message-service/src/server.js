import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import router from "./router/index.js";
import "./model/db.js";

const app = express();

app.use(
  cors({
    origin: true, // Allow all origins
    methods: ["GET", "POST"], // Allow only GET and POST requests
    allowedHeaders: ["Content-Type", "Authorization"], // Allow only Content-Type and Authorization headers
    credentials: true, // Allow cookies and other credentials
  })
);

app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: true },
});

io.on("connection", (socket) => {
  console.log(`User connected. socketId: ${socket.id}`);

  socket.on("message", (message) => {
    console.log("[event::message][on]");

    // Emit to notify about the new message
    io.emit("messageReceived", message);
    console.log("[event::messageReceived][emit]");
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected. socketId: ${socket.id}`);
  });
});

app.use("/message", router());

const PORT = 4000;
httpServer.listen(4000, () => {
  console.log(`Server is running on port ${PORT}`);
});
