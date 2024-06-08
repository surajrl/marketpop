"use client";

import { useContext, useRef, useState } from "react";
import { toast } from "sonner";
import TextareaAutosize from "react-textarea-autosize";
import { SendMessageButton } from "./SendMessageButton";
import { SocketContext } from "@/context/SocketContext";
import { sendMessage } from "@/api/messages";
import axios from "axios";
import { MESSAGE_URL } from "@/api/constants";

export default function ChatInput({ chatId, user, recipientUser }) {
  const textareaRef = useRef(null);
  const { socket } = useContext(SocketContext);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendChatMessage = async () => {
    if (!message) return;
    setIsLoading(true);

    try {
      const response = await sendMessage(chatId, user.id, message);

      if (!response) {
        toast.error("Failed to send message. Please try again.");
        return;
      }

      if (!socket) return;
      socket.emit("message", response);

      setMessage("");
      textareaRef.current?.focus();
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendChatMessage();
            }
          }}
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Message ${recipientUser.username}`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6 px-2"
        />

        <div
          onClick={() => textareaRef.current?.focus()}
          className="py-2"
          aria-hidden="true"
        >
          <div className="py-px">
            <div className="h-9" />
          </div>
        </div>

        <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrin-0">
            <SendMessageButton
              isLoading={isLoading}
              onClick={sendChatMessage}
              type="submit"
            >
              Send
            </SendMessageButton>
          </div>
        </div>
      </div>
    </div>
  );
}
