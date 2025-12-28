import { useEffect } from 'react';
import { useSocket as useSocketContext } from '../context/SocketContext';

/**
 * Custom hook for socket event listeners
 */
export const useSocket = (eventName, callback) => {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (socket && eventName && callback) {
      socket.on(eventName, callback);

      return () => {
        socket.off(eventName, callback);
      };
    }
  }, [socket, eventName, callback]);

  return socket;
};