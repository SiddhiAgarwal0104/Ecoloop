// config/socket.js  (BACKEND)
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const connectedUsers = new Map();

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174').split(','),
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  console.log('🔌 Socket.IO initialized');

  // ── AUTH MIDDLEWARE ────────────────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token provided'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.locality = decoded.locality;
      socket.pincode = decoded.pincode;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // ── CONNECTION ─────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.userId} connected [${socket.id}]`);

    if (!connectedUsers.has(socket.userId)) connectedUsers.set(socket.userId, new Set());
    connectedUsers.get(socket.userId).add(socket.id);

    // Personal notification room
    socket.join(socket.userId);

    // Locality room
    if (socket.locality && socket.pincode) {
      socket.join(`locality:${socket.locality}:${socket.pincode}`);
    }

    // ── JOIN chat room (snake_case — matches frontend) ─────────────────────
    socket.on('join_chat_room', ({ roomId }) => {
      if (!roomId) return;
      const id = roomId.toString();
      socket.join(id);
      console.log(`💬 User ${socket.userId} joined room ${id}`);
      socket.emit('joined_room', { roomId: id }); // confirm back
    });

    // ── Also handle camelCase for backwards compatibility ──────────────────
    socket.on('joinChatRoom', (chatRoomId) => {
      if (!chatRoomId) return;
      const id = chatRoomId.toString();
      socket.join(id);
      console.log(`💬 User ${socket.userId} joined room (camel) ${id}`);
    });

    // ── LEAVE ──────────────────────────────────────────────────────────────
    socket.on('leave_chat_room', ({ roomId }) => {
      if (!roomId) return;
      socket.leave(roomId.toString());
    });

    socket.on('leaveChatRoom', (chatRoomId) => {
      if (!chatRoomId) return;
      socket.leave(chatRoomId.toString());
    });

    // ── TYPING ─────────────────────────────────────────────────────────────
    socket.on('typing', ({ roomId, isTyping, chatRoomId }) => {
      // support both naming conventions
      const id = (roomId || chatRoomId)?.toString();
      if (!id) return;
      socket.to(id).emit('typing', { userId: socket.userId, isTyping });
    });

    // ── DISCONNECT ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.userId} disconnected [${socket.id}]`);
      const sockets = connectedUsers.get(socket.userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) connectedUsers.delete(socket.userId);
      }
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

const sendToUser = (userId, event, data) => {
  if (!io) return;
  io.to(userId.toString()).emit(event, data);
};

module.exports = { initSocket, getIO, sendToUser };