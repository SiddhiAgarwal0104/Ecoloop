// src/services/socketService.js  (FRONTEND)
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this._pendingRooms = new Set();
  }

  connect(token) {
    // Already connected with a live socket — do nothing
    if (this.socket?.connected) return this.socket;

    // Socket object exists but disconnected — update token and reconnect
    if (this.socket) {
      this.socket.auth = { token };
      this.socket.connect();
      return this.socket;
    }

    // First time — create socket
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      // Re-join all tracked rooms after connect / reconnect
      this._pendingRooms.forEach((roomId) => {
        this.socket.emit('join_chat_room', { roomId });
        console.log('📡 Re-joined room after connect:', roomId);
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ Socket error:', err.message);
    });

    return this.socket;
  }

  disconnect() {
    this._pendingRooms.clear();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChatRoom(roomId) {
    if (!roomId) return;
    const id = roomId.toString();
    this._pendingRooms.add(id);

    if (this.socket?.connected) {
      this.socket.emit('join_chat_room', { roomId: id });
      console.log('📡 Emitted join_chat_room:', id);
    } else {
      console.log('⏳ Queued join_chat_room (pending connect):', id);
    }
  }

  leaveChatRoom(roomId) {
    if (!roomId) return;
    const id = roomId.toString();
    this._pendingRooms.delete(id);
    this.socket?.emit('leave_chat_room', { roomId: id });
  }

  sendTyping(roomId, isTyping) {
    if (!roomId || !this.socket?.connected) return;
    this.socket.emit('typing', { roomId: roomId.toString(), isTyping });
  }

  on(event, cb) {
    this.socket?.on(event, cb);
  }

  off(event, cb) {
    this.socket?.off(event, cb);
  }

  emit(event, data) {
    this.socket?.emit(event, data);
  }

  get connected() {
    return this.socket?.connected ?? false;
  }
}

export default new SocketService();