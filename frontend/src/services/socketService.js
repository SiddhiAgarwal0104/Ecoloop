import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        auth: {
          token: token,
        },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChatRoom(chatRoomId) {
    if (this.socket) {
      this.socket.emit('joinChatRoom', chatRoomId);
    }
  }

  leaveChatRoom(chatRoomId) {
    if (this.socket) {
      this.socket.emit('leaveChatRoom', chatRoomId);
    }
  }

  sendTypingIndicator(chatRoomId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { chatRoomId, isTyping });
    }
  }

  markMessagesAsRead(chatRoomId) {
    if (this.socket) {
      this.socket.emit('markAsRead', { chatRoomId });
    }
  }

  on(eventName, callback) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }
}

export default new SocketService();