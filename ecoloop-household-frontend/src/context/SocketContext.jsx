import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const socketInstance = socketService.connect(token);
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
          setConnected(true);
          console.log('Socket connected');
        });

        socketInstance.on('disconnect', () => {
          setConnected(false);
          console.log('Socket disconnected');
        });

        socketInstance.on('error', (error) => {
          console.error('Socket error:', error);
          // Don't fail if socket errors
        });

        return () => {
          try {
            socketService.disconnect();
          } catch (e) {
            console.error('Error disconnecting socket:', e);
          }
          setConnected(false);
        };
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        setSocket(null);
        setConnected(false);
      }
    }
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: socket || null, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    // Return a default context instead of throwing
    return { socket: null, connected: false };
  }
  return context;
};