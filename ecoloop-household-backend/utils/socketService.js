const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const connectedUsers = new Map(); // userId -> socket.id

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174').split(','),
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  console.log('🔌 Socket.IO initialized');

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role || 'HOUSEHOLD';
      console.log(`✅ Socket authenticated for user ${socket.userId} (${socket.userRole})`);
      next();
    } catch (err) {
      console.error('❌ Socket auth error:', err.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔗 User ${socket.userId} connected with socket ${socket.id}`);
    connectedUsers.set(socket.userId, socket.id);

    // ─── CHAT ROOM EVENTS ───────────────────────────────────────────
    
    // User joins a specific chat room
    socket.on('join_chat_room', ({ roomId }) => {
      if (!roomId) return;
      socket.join(roomId.toString());
      console.log(`💬 User ${socket.userId} joined chat room: ${roomId}`);
    });

    // User leaves a specific chat room
    socket.on('leave_chat_room', ({ roomId }) => {
      if (!roomId) return;
      socket.leave(roomId.toString());
      console.log(`💬 User ${socket.userId} left chat room: ${roomId}`);
    });

    // ─── DISCONNECT ─────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.userId} disconnected`);
      connectedUsers.delete(socket.userId);
    });

    socket.on('error', (error) => {
      console.error(`❌ Socket error for user ${socket.userId}:`, error);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.error('❌ Socket.IO not initialized');
    return null;
  }
  return io;
};

/**
 * Emit a new chat message to everyone in the chat room
 * Call this from your chat message controller after saving to DB
 * @param {string} roomId - The ChatRoom _id
 * @param {Object} message - The saved message document
 */
const emitChatMessage = (roomId, message) => {
  if (!io) return;
  console.log(`💬 Emitting new_chat_message to room: ${roomId}`);
  io.to(roomId.toString()).emit('new_chat_message', message);
};

// ─── EXISTING FUNCTIONS (unchanged) ─────────────────────────────────

const emitNewRecycleRequest = (recycleData) => {
  if (!io) return;
  io.emit('new_recycle_request', {
    message: 'New waste pickup request available',
    data: recycleData,
    timestamp: new Date()
  });
};

const emitRequestAccepted = (householdUserId, requestData) => {
  if (!io) return;
  io.emit('request_accepted', {
    message: 'Your waste request has been accepted',
    data: requestData,
    timestamp: new Date()
  });
};

const emitStatusUpdate = (userId, updateData) => {
  if (!io) return;
  io.emit('status_updated', {
    message: 'Request status has been updated',
    data: updateData,
    timestamp: new Date()
  });
};

const sendNotification = (userId, notificationData) => {
  if (!io) return;
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', {
      ...notificationData,
      timestamp: new Date()
    });
  }
};

const broadcastNotification = (notificationData) => {
  if (!io) return;
  io.emit('notification', { ...notificationData, timestamp: new Date() });
};

const getConnectedUsersInfo = () => {
  if (!io) return { connected: false, users: [], clientsCount: 0 };
  return {
    connected: true,
    users: Array.from(connectedUsers.entries()).map(([userId, socketId]) => ({ userId, socketId })),
    clientsCount: io.engine.clientsCount || 0
  };
};

module.exports = {
  initSocket,
  getIO,
  emitChatMessage,       // NEW
  emitNewRecycleRequest,
  emitRequestAccepted,
  emitStatusUpdate,
  sendNotification,
  broadcastNotification,
  getConnectedUsersInfo
};