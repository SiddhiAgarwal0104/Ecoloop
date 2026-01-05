// const express = require('express');
// const router = express.Router();
// const {
//   getNotifications,
//   markAsRead,
//   markAllAsRead,
//   deleteNotification,
//   getUnreadCount
// } = require('../controllers/notificationController');
// const { protect, restrictTo } = require('../middleware/authMiddleware');

// // Apply authentication and role restriction to all routes
// router.use(protect);
// router.use(restrictTo('HOUSEHOLD'));

// // Routes
// router.get('/', getNotifications);
// router.get('/unread-count', getUnreadCount);
// router.put('/read-all', markAllAsRead);
// router.put('/:id/read', markAsRead);
// router.delete('/:id', deleteNotification);

// module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * Household Notification Routes
 * All routes require HOUSEHOLD role authentication
 */

// Apply authentication and role restriction to all routes
router.use(protect);
router.use(restrictTo('HOUSEHOLD'));

// @route   GET /api/notifications
// @desc    Get all notifications for household
router.get('/', getNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Get count of unread notifications
router.get('/unread-count', getUnreadCount);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
router.put('/read-all', markAllAsRead);

// @route   PUT /api/notifications/:id/read
// @desc    Mark specific notification as read
router.put('/:id/read', markAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete a specific notification
router.delete('/:id', deleteNotification);

module.exports = router;