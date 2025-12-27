const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification
} = require('../controllers/notification.controller');

// All routes protected
router.use(protect);

// GET /api/notifications
router.get('/', getNotifications);

// Mark read
router.put('/:id/read', markAsRead);

// Admin: create and delete
router.post('/', authorize('admin'), createNotification);
router.delete('/:id', authorize('admin'), deleteNotification);

module.exports = router;
