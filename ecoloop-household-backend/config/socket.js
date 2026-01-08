const socketIO = require('socket.io');

let io;

/**
 * Initialize Socket.IO server
 * @param {object} server - HTTP server instance
 * @returns {object} Socket.IO instance
 */
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174').split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  console.log('Socket.IO initialized with CORS origins:', process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174');
  return io;
};

/**
 * Get Socket.IO instance
 * @returns {object|null} Socket.IO instance or null if not initialized
 */
const getIO = () => {
  if (!io) {
    console.warn('⚠️ Socket.IO not initialized');
    return null;
  }
  return io;
};

module.exports = { initializeSocket, getIO };