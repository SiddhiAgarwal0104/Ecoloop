const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const connectedUsers = new Map(); // userId -> socket.id

/**
 * Initialize Socket.IO
 * @param {http.Server} server - Express server instance
 */
const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174').split(','),
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  console.log('🔌 Socket.IO initialized with CORS origins:', process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174');

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role || 'RECYCLER'; // Default to RECYCLER if role not in token
      console.log(`✅ Socket authenticated for user ${socket.userId} (${socket.userRole})`);
      next();
    } catch (err) {
      console.error('❌ Socket auth error:', err.message);
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`🔗 User ${socket.userId} connected with socket ${socket.id}`);
    connectedUsers.set(socket.userId, socket.id);

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.userId} disconnected`);
      connectedUsers.delete(socket.userId);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`❌ Socket error for user ${socket.userId}:`, error);
    });
  });

  return io;
};

/**
 * Get Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    console.error('❌ Socket.IO not initialized');
  }
  return io;
};

/**
 * Emit new recycle request to all connected recyclers
 * @param {Object} recycleData - The new recycle request data
 */
const emitNewRecycleRequest = (recycleData) => {
  if (!io) return;
  console.log(`📢 Broadcasting new recycle request to all recyclers`);
  io.emit('new_recycle_request', {
    message: 'New waste pickup request available',
    data: recycleData,
    timestamp: new Date()
  });
};

/**
 * Emit request accepted notification to household user
 * @param {string} householdUserId - The household user ID
 * @param {Object} requestData - The accepted request data
 */
const emitRequestAccepted = (householdUserId, requestData) => {
  if (!io) return;
  console.log(`📢 Notifying household user ${householdUserId} about accepted request`);
  io.emit('request_accepted', {
    message: 'Your waste request has been accepted',
    data: requestData,
    timestamp: new Date()
  });
};

/**
 * Emit status update notification
 * @param {string} userId - The user ID to notify
 * @param {Object} updateData - The status update data
 */
const emitStatusUpdate = (userId, updateData) => {
  if (!io) return;
  console.log(`📢 Notifying user ${userId} about status update`);
  io.emit('status_updated', {
    message: 'Request status has been updated',
    data: updateData,
    timestamp: new Date()
  });
};

/**
 * Send notification to specific user
 * @param {string} userId - The user ID
 * @param {Object} notificationData - Notification details
 */
const sendNotification = (userId, notificationData) => {
  if (!io) return;
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    console.log(`📧 Sending notification to user ${userId}`);
    io.to(socketId).emit('notification', {
      ...notificationData,
      timestamp: new Date()
    });
  } else {
    console.log(`⚠️ User ${userId} is not connected`);
  }
};

/**
 * Send notification to all connected users
 * @param {Object} notificationData - Notification details
 */
const broadcastNotification = (notificationData) => {
  if (!io) {
    console.warn('⚠️ Socket.IO not initialized');
    return;
  }
  
  const fullNotification = {
    ...notificationData,
    timestamp: new Date()
  };
  
  console.log(`📢 Broadcasting notification to all connected users`);
  console.log(`   - Type: ${fullNotification.type}`);
  console.log(`   - Title: ${fullNotification.title}`);
  console.log(`   - Connected clients: ${io.engine.clientsCount || 'unknown'}`);
  console.log(`   - Full notification:`, JSON.stringify(fullNotification, null, 2));
  
  io.emit('notification', fullNotification);
  console.log(`✅ Notification emitted`);
};

/**
 * Get connected users info for diagnostics
 */
const getConnectedUsersInfo = () => {
  if (!io) {
    return {
      connected: false,
      users: [],
      clientsCount: 0
    };
  }
  
  return {
    connected: true,
    users: Array.from(connectedUsers.entries()).map(([userId, socketId]) => ({
      userId,
      socketId
    })),
    clientsCount: io.engine.clientsCount || 0
  };
};

module.exports = {
  initSocket,
  getIO,
  emitNewRecycleRequest,
  emitRequestAccepted,
  emitStatusUpdate,
  sendNotification,
  broadcastNotification,
  getConnectedUsersInfo
};
