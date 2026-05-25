// config/socket.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const connectedUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174').split(','),
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  console.log('🔌 Socket.IO initialized');

  // ── AUTH MIDDLEWARE ────────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token provided'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // ── CONNECTION ─────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.userId} connected [${socket.id}]`);
    connectedUsers.set(socket.userId, socket.id);

    // Join personal room (for direct notifications)
    socket.join(socket.userId);

    // ── JOIN chat room ─────────────────────────────────────────────
    socket.on('join_chat_room', ({ roomId }) => {
      if (!roomId) return;
      socket.join(roomId.toString());
      console.log(`💬 User ${socket.userId} joined room ${roomId}`);
    });

    // ── LEAVE chat room ────────────────────────────────────────────
    socket.on('leave_chat_room', ({ roomId }) => {
      if (!roomId) return;
      socket.leave(roomId.toString());
      console.log(`💬 User ${socket.userId} left room ${roomId}`);
    });

    // ── TYPING indicator ───────────────────────────────────────────
    socket.on('typing', ({ roomId, isTyping }) => {
      if (!roomId) return;
      socket.to(roomId.toString()).emit('typing', {
        userId: socket.userId,
        isTyping,
      });
    });

    // ── DISCONNECT ─────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.userId} disconnected`);
      connectedUsers.delete(socket.userId);
    });

    socket.on('error', (err) => {
      console.error(`❌ Socket error [${socket.userId}]:`, err.message);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('⚠️  Socket.IO not yet initialized');
    return null;
  }
  return io;
};

// Send a notification to a specific user (if online)
const sendToUser = (userId, event, data) => {
  if (!io) return;
  const socketId = connectedUsers.get(userId?.toString());
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

module.exports = { initSocket, getIO, sendToUser };