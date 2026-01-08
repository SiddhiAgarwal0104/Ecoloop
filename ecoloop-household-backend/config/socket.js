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
 * @returns {object} Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };