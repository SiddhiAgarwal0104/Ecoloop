import api from './api';

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (page = 1, limit = 20, isRead = null) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (isRead !== null) {
      params.append('isRead', isRead);
    }
    
    const response = await api.get(`/community/notifications?${params}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(
      `/community/notifications/${notificationId}/read`
    );
    return response.data.data || {};
  } catch (error) {
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
  try {
    const response = await api.put('/community/notifications/read-all');
    return response.data.data || {};
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(
      `/community/notifications/${notificationId}`
    );
    return response.data.data || {};
  } catch (error) {
    throw error;
  }
};
