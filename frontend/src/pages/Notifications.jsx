import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Bell } from 'lucide-react';
import { format } from 'date-fns';
import { getNotifications as fetchNotificationsApi, markAsRead as markAsReadApi } from '../services/notificationService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetchNotificationsApi();
      setNotifications(response.data || []);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setError(error.message || 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await markAsReadApi(notificationId);
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="card bg-red-50 border border-red-200 p-6">
          <p className="text-red-600 font-semibold">Error: {error}</p>
          <button onClick={fetchNotifications} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-eco-dark mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your activities</p>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => !notification.read && markAsRead(notification._id)}
                className={`card cursor-pointer transition ${
                  !notification.read ? 'border-l-4 border-eco-main bg-eco-light' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-eco-main p-3 rounded-xl flex-shrink-0">
                    <Bell className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-eco-dark">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="bg-eco-main text-white text-xs px-3 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-2">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-3">
                      {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
