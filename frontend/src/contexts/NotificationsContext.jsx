// src/contexts/NotificationsContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/notifications', { params: { unread: unreadOnly } });
      setNotifications(res.data.data || []);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch notifications');
      setLoading(false);
      return { success: false, error };
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? res.data.data : n)));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to mark notification');
      return { success: false, error };
    }
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, loading, error, fetchNotifications, markAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
