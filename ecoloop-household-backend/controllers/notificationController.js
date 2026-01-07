const Notification = require('../models/Notification');
const AppError = require('../utils/appError');

/**
 * Get all notifications for logged-in recycler
 * @route GET /api/recycler/notifications
 * @access Private (Recycler only)
 */
exports.getMyNotifications = async (req, res, next) => {
  try {
    const recyclerId = req.user?.id;

    const notifications = await Notification.find({
      recyclerId: recyclerId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    next(error);
  }
};

/**
 * Mark notification as read
 * @route PATCH /api/recycler/notifications/:id/read
 * @access Private (Recycler only)
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recyclerId = req.user?.id;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    // Verify ownership
    if (notification.recyclerId.toString() !== recyclerId) {
      return next(new AppError('Not authorized to update this notification', 403));
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    next(error);
  }
};

/**
 * Delete a notification
 * @route DELETE /api/recycler/notifications/:id
 * @access Private (Recycler only)
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recyclerId = req.user?.id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    // Verify ownership
    if (notification.recyclerId.toString() !== recyclerId) {
      return next(new AppError('Not authorized to delete this notification', 403));
    }

    await Notification.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    next(error);
  }
};

/**
 * Clear all notifications for recycler
 * @route DELETE /api/recycler/notifications
 * @access Private (Recycler only)
 */
exports.clearAllNotifications = async (req, res, next) => {
  try {
    const recyclerId = req.user?.id;

    const result = await Notification.deleteMany({
      recyclerId: recyclerId
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications deleted`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
    next(error);
  }
};

/**
 * Create notification (internal use only)
 * @param {Object} notificationData - Notification details
 */
exports.createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    console.log('✅ Notification created:', notification._id);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};
