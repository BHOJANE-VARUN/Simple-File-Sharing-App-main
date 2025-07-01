const express = require("express");
const app = express();
const port = 3001;
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());

io.on("connection", function (socket) {
  // socket.on("receiver-join", function (data) {
  //   socket.join(data.uid);
  //   console.log("Receiver joined:", data.uid, " -> sender:", data.sender_uid);
  //   socket.in(data.sender_uid).emit("init", data);
  // });
  socket.on("file-meta", function (data) {
    socket.in(data.uid).emit("fs-meta", data.metadata);
  });
  socket.on("fs-start", function (data) {
    socket.in(data.uid).emit("fs-share", {});
  });
  socket.on("file-raw", function (data) {
    socket.in(data.uid).emit("fs-share",data);
  });
  socket.on("switch-room", function ({ oldRoom, newRoom }) {
    console.log(`Switching from room: ${oldRoom} to room: ${newRoom}`);
    if (oldRoom && socket.rooms.has(oldRoom)) {
      socket.leave(oldRoom);
      console.log(`Left old room: ${oldRoom}`);
    }

    socket.join(newRoom);
    console.log(`Joined new room: ${newRoom}`);

    socket.emit("room-switched", newRoom);
  });
  socket.on("Sender-Details", function (data) {
    if (!data?.data?.userDetails) {
      console.error("userDetails is missing from Sender-Details payload");
      return;
    }
    data.data.userDetails.sender_uid = data.data.sender_uid;
    socket
      .to(data.data.receiver_uid)
      .emit("Sender-Details", data.data);
  });
    socket.on("verifyRoom", (data) => {
      // console.log(io.sockets.adapter.rooms)
    const roomExists = io.sockets.adapter.rooms.has(data.sender_uid);

    if(roomExists)
    {
      socket.join(data.uid);
      console.log("Receiver joined:", data.uid, " -> sender:", data.sender_uid);
      socket.in(data.sender_uid).emit("init", data);
      socket.emit("room-exists");
    }
    else{
      socket.emit("room-notexist");
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
