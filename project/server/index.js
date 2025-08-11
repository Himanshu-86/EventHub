const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const rooms = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', ({ roomId, user }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push({ ...user, id: socket.id });
    socket.join(roomId);

    io.to(roomId).emit('update-participants', rooms[roomId]);

    socket.to(roomId).emit('user-joined', { ...user, id: socket.id });

    console.log(`${user.name} joined room ${roomId}`);
  });

  socket.on('signal', ({ to, signal }) => {
    io.to(to).emit('signal', { from: socket.id, signal });
  });

  socket.on('disconnecting', () => {
    const socketRooms = Array.from(socket.rooms);
    socketRooms.forEach(roomId => {
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter(p => p.id !== socket.id);
        io.to(roomId).emit('update-participants', rooms[roomId]);
        socket.to(roomId).emit('user-left', socket.id);
        console.log(`User ${socket.id} left room ${roomId}`);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Signaling server running on port ${PORT}`));
