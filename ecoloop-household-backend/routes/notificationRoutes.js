const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * Recycler Notification Routes
 * All routes require authentication
 */

// Protect all routes - Recycler only
router.use(protect);
router.use(restrictTo('RECYCLER'));

// Get all notifications
router.get('/', getMyNotifications);

// Mark as read
router.patch('/:id/read', markAsRead);

// Delete a notification
router.delete('/:id', deleteNotification);

// Clear all notifications
router.delete('/', clearAllNotifications);

module.exports = router;
