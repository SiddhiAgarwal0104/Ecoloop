
import React, { useState, useEffect } from 'react';
import {
  Bell,
  Trash2,
  AlertCircle,
  CheckCircle,
  MapPin,
  Package,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import axios from '../api/axios';

const Notifications = () => {
  const {
    notifications,
    deleteNotification,
    clearAllNotifications,
    addNotification
  } = useNotifications();

  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch notifications from backend DB
   */
  const loadNotificationsFromAPI = async () => {
    try {
      setRefreshing(true);
      console.log('📡 Fetching notifications from API...');

      const response = await axios.get('/notifications');

      console.log('✅ Notifications API response:', response.data);

      if (Array.isArray(response.data.data)) {
        // Clear old context data to avoid duplicates
        clearAllNotifications();

        response.data.data.forEach((notif) => {
          addNotification({
            _id: notif._id,                 // ✅ IMPORTANT
            title: notif.title,
            message: notif.message,
            type: notif.type,
            data: notif.data,
            timestamp: notif.createdAt
          });
        });
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      alert('Failed to load notifications');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotificationsFromAPI();
  }, []);

  /**
   * Icons
   */
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'REQUEST_ACCEPTED':
        return <CheckCircle className="text-green-600" size={24} />;
      case 'STATUS_UPDATE':
        return <AlertCircle className="text-blue-600" size={24} />;
      case 'NEW_REQUEST':
        return <Package className="text-eco-main" size={24} />;
      default:
        return <Bell className="text-gray-600" size={24} />;
    }
  };

  /**
   * Colors
   */
  const getNotificationColor = (type) => {
    switch (type) {
      case 'REQUEST_ACCEPTED':
        return 'bg-green-50 border-green-200';
      case 'STATUS_UPDATE':
        return 'bg-blue-50 border-blue-200';
      case 'NEW_REQUEST':
        return 'bg-eco-light border-[#c8e6c9]';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  /**
   * Filter logic
   */
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Real-time updates for your requests
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadNotificationsFromAPI}
            disabled={refreshing}
            className="btn btn-primary btn-sm flex items-center gap-1"
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>

          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="btn btn-secondary btn-sm"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* FILTER TABS */}
      {notifications.length > 0 && (
  <div className="flex gap-2 border-b border-[#c8e6c9]">
    <button
      onClick={() => setFilter('all')}
      className={`px-4 py-2 font-medium border-b-2 transition-colors ${
        filter === 'all'
          ? 'border-eco-main text-eco-main'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      All ({notifications.length})
    </button>
  </div>
)}

      {/* NOTIFICATION LIST */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}   // ✅ FIXED
              className={`border rounded-lg p-4 flex items-start gap-4 ${getNotificationColor(
                notification.type
              )}`}
            >
              <div className="pt-1">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-gray-900">
                  {notification.title}
                </h3>
                <p className="text-gray-700 mt-1">
                  {notification.message}
                </p>

                {notification.data && (
                  <div className="mt-3 space-y-2 text-sm">
                    {notification.data.category && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package size={16} />
                        <span>
                          {notification.data.category} —{' '}
                          {notification.data.quantity}{' '}
                          {notification.data.unit}
                        </span>
                      </div>
                    )}

                    {notification.data.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} />
                        <span>{notification.data.location}</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => deleteNotification(notification._id)} // ✅ FIXED
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No notifications yet</p>
          </div>
        )}
      </div>

      {/* STATUS */}
      <div className="mt-8 p-4 bg-eco-light rounded-lg border border-[#c8e6c9] text-sm">
        <p className="text-eco-dark">
          <span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2"></span>
          Notification system active
        </p>
      </div>
    </div>
  );
};

export default Notifications;
