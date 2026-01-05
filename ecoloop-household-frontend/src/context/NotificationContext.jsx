// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { onNotification } from '../utils/socketService';

// /**
//  * Notification Context
//  * Manages real-time notifications globally across the app
//  */
// const NotificationContext = createContext(null);

// export const NotificationProvider = ({ children }) => {
//   const [notifications, setNotifications] = useState([]);

//   // Set up global notification listener - ONCE, never clean up
//   useEffect(() => {
//     console.log('🔔 Setting up global notification listener in NotificationProvider...');
    
//     // Register the callback - returns an unsubscribe function but we won't call it
//     const unsub = onNotification((notification) => {
//       console.log('📬 Notification received in NotificationProvider context:', notification);
//       console.log('   - Type:', notification.type);
//       console.log('   - Title:', notification.title);
//       console.log('   - Message:', notification.message);
      
//       setNotifications(prev => {
//         const updated = [
//           {
//             ...notification,
//             id: Date.now() + Math.random(),
//             timestamp: notification.timestamp || new Date(),
//             read: false
//           },
//           ...prev
//         ];
//         console.log(`   - Total notifications now: ${updated.length}`);
//         return updated;
//       });
//     });
    
//     console.log('✅ Notification listener registered in context (will not unsubscribe on unmount)');
    
//     // IMPORTANT: We intentionally do NOT unsubscribe on component unmount
//     // This ensures notifications persist across page navigation
//     // If you need to clean up later, you can manually call the unsub function
    
//   }, []);

//   const addNotification = useCallback((notification) => {
//     setNotifications(prev => [
//       {
//         ...notification,
//         id: Date.now() + Math.random(),
//         read: false
//       },
//       ...prev
//     ]);
//   }, []);

//   const deleteNotification = useCallback((id) => {
//     setNotifications(prev => prev.filter(n => n.id !== id));
//   }, []);

//   const clearAllNotifications = useCallback(() => {
//     setNotifications([]);
//   }, []);

//   return (
//     <NotificationContext.Provider
//       value={{
//         notifications,
//         addNotification,
//         deleteNotification,
//         clearAllNotifications
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// /**
//  * Hook to use notification context
//  */
// export const useNotifications = () => {
//   const context = useContext(NotificationContext);
//   if (!context) {
//     throw new Error('useNotifications must be used within NotificationProvider');
//   }
//   return context;
// };

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import { onNotification } from '../utils/socketService';

/**
 * Notification Context
 * Single source of truth for DB + Socket notifications
 */

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Add notification safely (DB or Socket)
   */
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => {
      // Use MongoDB _id if available
      const id = notification._id || notification.id;

      // Prevent duplicates
      if (id && prev.some((n) => n._id === id)) {
        return prev;
      }

      return [
        {
          ...notification,
          _id: id, // normalize ID
          timestamp: notification.timestamp || new Date(),
          isRead: notification.isRead ?? false
        },
        ...prev
      ];
    });
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Socket listener (REAL-TIME)
   */
  useEffect(() => {
    console.log('🔔 Registering global socket notification listener...');

    const unsubscribe = onNotification((notification) => {
      console.log('📬 Socket notification received:', notification);
      addNotification(notification);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        deleteNotification,
        clearAllNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
