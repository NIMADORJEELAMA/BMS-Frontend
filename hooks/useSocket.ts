// import { useEffect } from "react";
// import { io } from "socket.io-client";

// const SOCKET_URL = "http://localhost:3000"; // Your NestJS port

// export const useSocket = (onNewOrder: (order: any) => void) => {
//   useEffect(() => {
//     const socket = io(SOCKET_URL);

//     socket.on("newOrder", (data) => {
//       onNewOrder(data);
//       // Play a notification sound
//       new Audio("/Notification.mp3").play().catch(() => {});
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [onNewOrder]);
// };

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export const useSocket = (onNewOrder: (order: any) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. Initialize socket with robust options
    const socket = io(SOCKET_URL, {
      transports: ["websocket"], // Faster, bypasses most polling issues
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to Server ID:", socket.id);
    });

    socket.on("newOrder", (data) => {
      onNewOrder(data);
      // Play sound - note: audio objects are best initialized outside to prevent lag
      const audio = new Audio("/Notification.mp3");
      audio.play().catch(() => console.log("Sound blocked by browser policy"));
    });

    // 2. Tab Visibility Fix: If user comes back to a hibernated tab,
    // force a check if the socket is still alive.
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !socket.connected) {
        socket.connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      socket.off("newOrder");
      socket.disconnect();
    };
  }, [onNewOrder]); // Ensure onNewOrder is memoized in the parent to prevent loops
};
