const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Notification Routes
 * All routes require authentication (works for HOUSEHOLD, RECYCLER, NGO)
 */

// Protect all routes - all authenticated users
router.use(protect);

// Get all notifications
router.get('/', getMyNotifications);

// Mark as read
router.patch('/:id/read', markAsRead);

// Delete a notification
router.delete('/:id', deleteNotification);

// Clear all notifications
router.delete('/', clearAllNotifications);

module.exports = router;
