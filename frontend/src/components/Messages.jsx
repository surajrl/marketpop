"use client";

import { SocketContext } from "@/context/SocketContext";
import { cn } from "@/utils";
import { format } from "date-fns";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";

export default function Messages({ chatId, user, initialMessages }) {
  // Sort messages by date
  initialMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const [messages, setMessages] = useState(initialMessages);

  const scrollDownRef = useRef(null);

  const { socket } = useContext(SocketContext);

  const onMessageReceived = (payload) => {
    setMessages((prev) => [...prev, payload]);
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("messageReceived", onMessageReceived);

    return () => {
      // Remove all the event listeners we set up to avoid memory leaks and unintended behaviors.
      socket.off("messageReceived", onMessageReceived);
    };
  }, [socket, messages]);

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <div ref={scrollDownRef} />

      {sortedMessages.map((message, index) => {
        const isCurrentUser = message.senderId === user.id;

        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        return (
          <div className="chat-message" key={message._id}>
            <div
              className={cn("flex items-end", {
                "justify-end": isCurrentUser,
              })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none":
                      !hasNextMessageFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {message.message}{" "}
                  <span className="ml-2 text-xs text-gray-400">
                    {format(message.createdAt, "HH:mm")}
                  </span>
                </span>
              </div>

              <div
                className={cn("relative w-6 h-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  src="/circle-user-round.svg"
                  alt="Profile picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
