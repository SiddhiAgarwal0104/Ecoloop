const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/recyclerNotificationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * Recycler Notification Routes
 * All routes require RECYCLER role authentication
 */

// Protect all routes - Recycler only
router.use(protect);
router.use(restrictTo('RECYCLER'));

// @route   GET /api/recycler/notifications
// @desc    Get all notifications for recycler
router.get('/', getMyNotifications);

// @route   PATCH /api/recycler/notifications/:id/read
// @desc    Mark specific notification as read
router.patch('/:id/read', markAsRead);

// @route   DELETE /api/recycler/notifications/:id
// @desc    Delete a specific notification
router.delete('/:id', deleteNotification);

// @route   DELETE /api/recycler/notifications
// @desc    Clear all notifications for recycler
router.delete('/', clearAllNotifications);

module.exports = router;