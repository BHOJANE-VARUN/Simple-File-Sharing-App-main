const express = require('express');
const app = express();
const port = 3001;
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());

io.on('connection', (socket) => {
   // console.log('A user connected:', socket.id);

  socket.on('message', (msg) => {
    console.log('Message received:', msg);
   socket.broadcast.emit('message', msg);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})
