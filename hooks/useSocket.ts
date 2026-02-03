import { useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000"; // Your NestJS port

export const useSocket = (onNewOrder: (order: any) => void) => {
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("newOrder", (data) => {
      onNewOrder(data);
      // Play a notification sound
      new Audio("/Notification.mp3").play().catch(() => {});
    });

    return () => {
      socket.disconnect();
    };
  }, [onNewOrder]);
};
