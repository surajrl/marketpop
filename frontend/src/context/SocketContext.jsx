"use client";

import { SOCKET_SERVER_URL } from "@/api/constants";
import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  // State to store the socket instance
  const [socket, setSocket] = useState(null);

  // Setup the socket connection when the component mounts
  useEffect(() => {
    console.log(`Connecting to socket at ${SOCKET_SERVER_URL}`);
    setSocket(io(SOCKET_SERVER_URL));
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
