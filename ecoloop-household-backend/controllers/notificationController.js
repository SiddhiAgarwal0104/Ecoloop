// const Notification = require('../models/Notification');
// const AppError = require('../utils/appError');

// // @desc    Get all notifications for household user
// // @route   GET /api/notifications
// // @access  Private (Household only)
// exports.getNotifications = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 20, unreadOnly = false } = req.query;

//     const filter = { userId: req.user.id };
//     if (unreadOnly === 'true') {
//       filter.isRead = false;
//     }

//     const notifications = await Notification.find(filter)
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await Notification.countDocuments(filter);
//     const unreadCount = await Notification.countDocuments({ 
//       userId: req.user.id, 
//       isRead: false 
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         notifications,
//         pagination: {
//           total,
//           page: parseInt(page),
//           pages: Math.ceil(total / limit),
//           unreadCount
//         }
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Mark notification as read
// // @route   PUT /api/notifications/:id/read
// // @access  Private (Household only)
// exports.markAsRead = async (req, res, next) => {
//   try {
//     const notification = await Notification.findById(req.params.id);

//     if (!notification) {
//       return next(new AppError('Notification not found', 404));
//     }

//     // Check ownership
//     if (notification.userId.toString() !== req.user.id) {
//       return next(new AppError('Not authorized to update this notification', 403));
//     }

//     notification.isRead = true;
//     await notification.save();

//     res.status(200).json({
//       success: true,
//       message: 'Notification marked as read',
//       data: { notification }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Mark all notifications as read
// // @route   PUT /api/notifications/read-all
// // @access  Private (Household only)
// exports.markAllAsRead = async (req, res, next) => {
//   try {
//     await Notification.updateMany(
//       { userId: req.user.id, isRead: false },
//       { isRead: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'All notifications marked as read'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Delete notification
// // @route   DELETE /api/notifications/:id
// // @access  Private (Household only)
// exports.deleteNotification = async (req, res, next) => {
//   try {
//     const notification = await Notification.findById(req.params.id);

//     if (!notification) {
//       return next(new AppError('Notification not found', 404));
//     }

//     // Check ownership
//     if (notification.userId.toString() !== req.user.id) {
//       return next(new AppError('Not authorized to delete this notification', 403));
//     }

//     await notification.deleteOne();

//     res.status(200).json({
//       success: true,
//       message: 'Notification deleted successfully'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Get unread notification count
// // @route   GET /api/notifications/unread-count
// // @access  Private (Household only)
// exports.getUnreadCount = async (req, res, next) => {
//   try {
//     const count = await Notification.countDocuments({ 
//       userId: req.user.id, 
//       isRead: false 
//     });

//     res.status(200).json({
//       success: true,
//       data: { unreadCount: count }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const Notification = require('../models/HouseholdNotification');
const AppError = require('../utils/appError');

// @desc    Get all notifications for current user (ALL ROLES)
// @route   GET /api/notifications
// @access  Private (All authenticated users)
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const filter = { userId: req.user.id };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });

    console.log(`✅ Fetched ${notifications.length} notifications for ${req.user.role}`);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          unreadCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read (ALL ROLES)
// @route   PUT /api/notifications/:id/read
// @access  Private (All authenticated users)
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    // Check ownership
    if (notification.userId.toString() !== req.user.id) {
      return next(new AppError('Not authorized to update this notification', 403));
    }

    notification.isRead = true;
    await notification.save();

    console.log(`✅ Notification ${req.params.id} marked as read`);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read (ALL ROLES)
// @route   PUT /api/notifications/read-all
// @access  Private (All authenticated users)
exports.markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    console.log(`✅ Marked ${result.modifiedCount} notifications as read`);

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification (ALL ROLES)
// @route   DELETE /api/notifications/:id
// @access  Private (All authenticated users)
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    // Check ownership
    if (notification.userId.toString() !== req.user.id) {
      return next(new AppError('Not authorized to delete this notification', 403));
    }

    await notification.deleteOne();

    console.log(`✅ Notification ${req.params.id} deleted`);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all notifications (ALL ROLES)
// @route   DELETE /api/notifications/clear-all
// @access  Private (All authenticated users)
exports.clearAllNotifications = async (req, res, next) => {
  try {
    const result = await Notification.deleteMany({
      userId: req.user.id
    });

    console.log(`✅ Cleared ${result.deletedCount} notifications`);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications deleted`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count (ALL ROLES)
// @route   GET /api/notifications/unread-count
// @access  Private (All authenticated users)
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });

    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create notification (Internal use only)
// @access  Internal
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

module.exports = exports;