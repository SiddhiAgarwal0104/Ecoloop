const jwt = require('jsonwebtoken');
const ChatMessage = require('../models/ChatMessage');
const ChatRoom = require('../models/ChatRoom');
const { createNotification } = require('../utils/notificationHelper');

/**
 * Initialize chat socket handlers
 * @param {object} io - Socket.IO instance
 */
const initializeChatSocket = (io) => {
  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.locality = decoded.locality;
      socket.pincode = decoded.pincode;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room for notifications
    socket.join(socket.userId);

    // Join locality room for new request notifications
    socket.join(`locality:${socket.locality}:${socket.pincode}`);

    /**
     * Join a specific chat room
     */
    socket.on('joinChatRoom', async (chatRoomId) => {
      try {
        // Verify user is participant
        const chatRoom = await ChatRoom.findById(chatRoomId);
        if (!chatRoom) {
          socket.emit('error', { message: 'Chat room not found' });
          return;
        }

        const isParticipant = chatRoom.participants.some(
          (p) => p.userId.toString() === socket.userId
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        socket.join(chatRoomId);
        console.log(`User ${socket.userId} joined chat room ${chatRoomId}`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Leave a chat room
     */
    socket.on('leaveChatRoom', (chatRoomId) => {
      socket.leave(chatRoomId);
      console.log(`User ${socket.userId} left chat room ${chatRoomId}`);
    });

    /**
     * Typing indicator
     */
    socket.on('typing', ({ chatRoomId, isTyping }) => {
      socket.to(chatRoomId).emit('userTyping', {
        userId: socket.userId,
        isTyping,
      });
    });

    /**
     * Mark messages as read
     */
    socket.on('markAsRead', async ({ chatRoomId }) => {
      try {
        await ChatMessage.updateMany(
          {
            chatRoomId,
            senderId: { $ne: socket.userId },
            isRead: false,
          },
          { isRead: true }
        );

        socket.to(chatRoomId).emit('messagesRead', {
          chatRoomId,
          readBy: socket.userId,
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

module.exports = initializeChatSocket;