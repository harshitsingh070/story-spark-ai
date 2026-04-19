import { io } from "socket.io-client";
import { getUserInfo } from "../services/auth.service";

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  "https://notification-socket-io.onrender.com";

export const socketIo = io(socketUrl, {
  transports: ["websocket", "polling"],
  query: { userEmail: getUserInfo()?.email },
  withCredentials: true,
});
