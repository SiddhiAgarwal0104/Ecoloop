// import React, { useState, useEffect } from 'react';
// import { Bell, Trash2, AlertCircle, CheckCircle, MapPin, Package, RefreshCw } from 'lucide-react';
// import { useNotifications } from '../context/NotificationContext';
// import axios from '../api/axios';

// /**
//  * Notifications Page Component
//  * Displays real-time notifications for recycler activities
//  */
// const Notifications = () => {
//   const { notifications, deleteNotification, clearAllNotifications, addNotification } = useNotifications();
//   const [filter, setFilter] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // Fetch notifications from API
//   const loadNotificationsFromAPI = async () => {
//     try {
//       console.log('📡 Fetching notifications from API...');
//       setRefreshing(true);
      
//       const response = await axios.get('/recycler/notifications');
//       console.log('✅ Notifications API response:', response.data);
      
//       // If there are notifications in the response, add them
//       if (response.data.data && Array.isArray(response.data.data)) {
//         console.log(`📊 Found ${response.data.data.length} notifications in database`);
//         response.data.data.forEach(notif => {
//           // Add each notification from DB to context
//           addNotification({
//             title: notif.title,
//             message: notif.message,
//             type: notif.type,
//             data: notif.data,
//             timestamp: notif.createdAt,
//             _id: notif._id // Include DB ID to avoid duplicates
//           });
//         });
//       } else {
//         console.log('⚠️ No notifications in API response');
//       }
//     } catch (error) {
//       console.error('❌ Error fetching notifications:', error);
//       alert(`Error loading notifications: ${error.message}`);
//     } finally {
//       setRefreshing(false);
//       setLoading(false);
//     }
//   };

//   // Fetch on mount
//   useEffect(() => {
//     loadNotificationsFromAPI();
//   }, []);

//   /**
//    * Get notification icon based on type
//    */
//   const getNotificationIcon = (type) => {
//     switch (type) {
//       case 'REQUEST_ACCEPTED':
//         return <CheckCircle className="text-green-600" size={24} />;
//       case 'STATUS_UPDATE':
//         return <AlertCircle className="text-blue-600" size={24} />;
//       case 'NEW_REQUEST':
//         return <Package className="text-eco-main" size={24} />;
//       default:
//         return <Bell className="text-gray-600" size={24} />;
//     }
//   };

//   /**
//    * Get notification color based on type
//    */
//   const getNotificationColor = (type) => {
//     switch (type) {
//       case 'REQUEST_ACCEPTED':
//         return 'bg-green-50 border-green-200';
//       case 'STATUS_UPDATE':
//         return 'bg-blue-50 border-blue-200';
//       case 'NEW_REQUEST':
//         return 'bg-eco-light border-[#c8e6c9]';
//       default:
//         return 'bg-gray-50 border-gray-200';
//     }
//   };



//   /**
//    * Filter notifications
//    */
//   const filteredNotifications = notifications.filter(n => {
//     if (filter === 'all') return true;
//     return n.type === filter;
//   });

//   /**
//    * Check socket status for diagnostics
//    */
//   const checkSocketStatus = async () => {
//     try {
//       const token = localStorage.getItem('recycler_token');
//       console.log('🔍 Checking socket status...');
      
//       const response = await fetch('http://localhost:5001/api/integration/recycle/socket-status', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         console.log('✅ Socket Status:', data.data);
//         alert(`Socket Status:\n\n${JSON.stringify(data.data, null, 2)}`);
//       } else {
//         console.error('❌ Failed to get socket status');
//       }
//     } catch (err) {
//       console.error('❌ Error checking socket status:', err);
//       alert(`Error: ${err.message}`);
//     }
//   };

//   /**
//    * Test DB notification (creates notification in database)
//    */
//   const testDBNotification = async () => {
//     try {
//       const token = localStorage.getItem('recycler_token');
//       console.log('🗄️ Testing DB notification - Creating in database...');
      
//       const response = await fetch('http://localhost:5001/api/integration/recycle/test-db-notification', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         console.log('✅ Test DB notification created:', data.data);
//         alert('✅ Test notification created in database! Refresh to see it.');
//       } else {
//         console.error('❌ Failed to create test DB notification');
//       }
//     } catch (err) {
//       console.error('❌ Error:', err);
//       alert(`Error: ${err.message}`);
//     }
//   };

//   /**
//    * Test notification (for development)
//    */
//   const testNotification = async () => {
//     try {
//       const token = localStorage.getItem('recycler_token');
//       console.log('🧪 Testing socket - Sending request to backend...');
//       console.log(`   - Token: ${token ? '✅ Present' : '❌ Missing'}`);
      
//       const response = await fetch('http://localhost:5001/api/integration/recycle/test-notification', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       console.log(`   - Response status: ${response.status}`);
      
//       if (response.ok) {
//         const data = await response.json();
//         console.log('✅ Test notification API call successful');
//         console.log(`   - Response:`, data);
//       } else {
//         console.error('❌ Failed to send test notification. Status:', response.status);
//         const errorText = await response.text();
//         console.error(`   - Error: ${errorText}`);
//       }
//     } catch (err) {
//       console.error('❌ Error sending test notification:', err);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="page-title">Notifications</h1>
//           <p className="text-gray-600 mt-1">Real-time updates for your requests</p>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={loadNotificationsFromAPI}
//             disabled={refreshing}
//             className="btn btn-primary btn-sm flex items-center gap-1"
//             title="Refresh notifications from database"
//           >
//             <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
//             Refresh
//           </button>
//           <button
//             onClick={testNotification}
//             className="btn btn-secondary btn-sm"
//             title="Send test notification to verify socket is working"
//           >
//             Test Socket
//           </button>
//           <button
//             onClick={testDBNotification}
//             className="btn btn-secondary btn-sm"
//             title="Create test notification in database"
//           >
//             Test DB
//           </button>
//           <button
//             onClick={checkSocketStatus}
//             className="btn btn-secondary btn-sm"
//             title="Check socket connection status"
//           >
//             Check Status
//           </button>
//           {notifications.length > 0 && (
//             <button
//               onClick={clearAllNotifications}
//               className="btn btn-secondary btn-sm"
//             >
//               Clear All
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Filter Tabs */}
//       {notifications.length > 0 && (
//         <div className="flex gap-2 border-b border-[#c8e6c9]">
//           <button
//             onClick={() => setFilter('all')}
//             className={`px-4 py-2 font-medium border-b-2 transition-colors ${
//               filter === 'all'
//                 ? 'border-eco-main text-eco-main'
//                 : 'border-transparent text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             All ({notifications.length})
//           </button>
//           <button
//             onClick={() => setFilter('REQUEST_ACCEPTED')}
//             className={`px-4 py-2 font-medium border-b-2 transition-colors ${
//               filter === 'REQUEST_ACCEPTED'
//                 ? 'border-eco-main text-eco-main'
//                 : 'border-transparent text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Accepted ({notifications.filter(n => n.type === 'REQUEST_ACCEPTED').length})
//           </button>
//           <button
//             onClick={() => setFilter('NEW_REQUEST')}
//             className={`px-4 py-2 font-medium border-b-2 transition-colors ${
//               filter === 'NEW_REQUEST'
//                 ? 'border-eco-main text-eco-main'
//                 : 'border-transparent text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             New Requests ({notifications.filter(n => n.type === 'NEW_REQUEST').length})
//           </button>
//           <button
//             onClick={() => setFilter('STATUS_UPDATE')}
//             className={`px-4 py-2 font-medium border-b-2 transition-colors ${
//               filter === 'STATUS_UPDATE'
//                 ? 'border-eco-main text-eco-main'
//                 : 'border-transparent text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Updates ({notifications.filter(n => n.type === 'STATUS_UPDATE').length})
//           </button>
//         </div>
//       )}

//       {/* Notifications List */}
//       <div className="space-y-4">
//         {filteredNotifications.length > 0 ? (
//           filteredNotifications.map((notification) => (
//             <div
//               key={notification.id}
//               className={`border rounded-lg p-4 flex items-start gap-4 transition-all hover:shadow-md ${getNotificationColor(
//                 notification.type
//               )}`}
//             >
//               {/* Icon */}
//               <div className="flex-shrink-0 pt-1">
//                 {getNotificationIcon(notification.type)}
//               </div>

//               {/* Content */}
//               <div className="flex-1 min-w-0">
//                 <h3 className="font-bold text-gray-900">{notification.title}</h3>
//                 <p className="text-gray-700 mt-1">{notification.message}</p>

//                 {/* Details */}
//                 {notification.data && (
//                   <div className="mt-3 space-y-2 text-sm">
//                     {notification.data.category && (
//                       <div className="flex items-center gap-2 text-gray-600">
//                         <Package size={16} />
//                         <span>
//                           {notification.data.category} - {notification.data.quantity}{' '}
//                           {notification.data.unit}
//                         </span>
//                       </div>
//                     )}
//                     {notification.data.location && (
//                       <div className="flex items-center gap-2 text-gray-600">
//                         <MapPin size={16} />
//                         <span>{notification.data.location}</span>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Timestamp */}
//                 <p className="text-xs text-gray-500 mt-2">
//                   {new Date(notification.timestamp).toLocaleString()}
//                 </p>
//               </div>

//               {/* Delete Button */}
//               <button
//                 onClick={() => deleteNotification(notification.id)}
//                 className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
//                 title="Delete notification"
//               >
//                 <Trash2 size={18} />
//               </button>
//             </div>
//           ))
//         ) : (
//           <div className="text-center py-12">
//             <Bell className="mx-auto text-gray-400 mb-4" size={48} />
//             <p className="text-gray-600 mb-2">No notifications yet</p>
//             <p className="text-sm text-gray-500">
//               {filter === 'all'
//                 ? "You're all caught up! New notifications will appear here"
//                 : `No ${filter.toLowerCase()} notifications found`}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Connection Status */}
//       <div className="mt-8 p-4 bg-eco-light rounded-lg border border-[#c8e6c9] text-sm">
//         <p className="text-eco-dark">
//           <span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2"></span>
//           Real-time notifications are active. Updates will appear instantly.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Notifications;

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
          {['all', 'REQUEST_ACCEPTED', 'NEW_REQUEST', 'STATUS_UPDATE'].map(
            (type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  filter === type
                    ? 'border-eco-main text-eco-main'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {type === 'all'
                  ? `All (${notifications.length})`
                  : type.replace('_', ' ')}
              </button>
            )
          )}
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
