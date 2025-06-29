import { io } from "socket.io-client";

 const socket = io("http://localhost:3001", {
  transports: ["websocket"],
  withCredentials: true,
});
socket.on("connect", () => {
      console.log("Connected to server");
    });
export { socket };
