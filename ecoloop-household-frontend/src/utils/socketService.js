import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

let socket = null;
const notificationCallbacks = [];

/**
 * Initialize Socket.IO connection
 * @param {string} token - JWT token for authentication
 * @returns {Object} socket instance
 */
export const initSocket = (token) => {
  if (socket?.connected) {
    console.log('✅ Socket already connected');
    return socket;
  }

  console.log(`🔌 Initializing socket connection to ${SOCKET_URL}`);
  console.log(`   - Token: ${token ? '✅ Present' : '❌ Missing'}`);

  socket = io(SOCKET_URL, {
    auth: {
      token: token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  // Set up notification listener (only once)
  socket.on('notification', (notification) => {
    console.log('📬 [SOCKET] "notification" event received:', notification);
    console.log(`   - Callbacks registered: ${notificationCallbacks.length}`);
    // Call all registered callbacks
    notificationCallbacks.forEach((cb, index) => {
      console.log(`   - Executing callback ${index + 1}/${notificationCallbacks.length}`);
      try {
        cb(notification);
      } catch (err) {
        console.error(`   - ❌ Error in callback ${index + 1}:`, err);
      }
    });
  });

  return socket;
};

/**
 * Get socket instance
 */
export const getSocket = () => {
  return socket;
};

/**
 * Listen to all notifications
 * @param {Function} callback - Called with notification data
 */
export const onNotification = (callback) => {
  if (!socket) {
    console.warn('⚠️ Socket not initialized');
    return;
  }
  
  // Add callback to list (avoid duplicate listeners)
  if (!notificationCallbacks.includes(callback)) {
    notificationCallbacks.push(callback);
    console.log('✅ Notification listener registered. Total listeners:', notificationCallbacks.length);
  }

  // Return unsubscribe function
  return () => {
    const index = notificationCallbacks.indexOf(callback);
    if (index > -1) {
      notificationCallbacks.splice(index, 1);
      console.log('❌ Notification listener unregistered');
    }
  };
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    notificationCallbacks.length = 0;
  }
};
