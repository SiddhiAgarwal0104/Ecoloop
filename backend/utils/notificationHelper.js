const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

/**
 * Create and emit notification
 * @param {Object} notificationData - Notification details
 */
exports.createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);

    // Emit real-time notification via Socket.IO
    const io = getIO();
    io.to(notificationData.userId.toString()).emit('notification', notification);

    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error.message);
  }
};

/**
 * Create return reminder notifications
 * Run as a scheduled job (e.g., daily cron job)
 */
exports.createReturnReminders = async () => {
  try {
    const CommunityRequest = require('../models/CommunityRequest');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find active lendings ending tomorrow
    const endingSoon = await CommunityRequest.find({
      status: 'ACTIVE',
      endDate: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    for (const request of endingSoon) {
      // Notify lender
      await this.createNotification({
        userId: request.acceptedBy,
        type: 'RETURN_REMINDER',
        title: 'Return reminder',
        message: `The item "${request.itemName}" is due for return tomorrow`,
        relatedId: request._id,
        relatedType: 'CommunityRequest',
      });

      // Notify borrower
      await this.createNotification({
        userId: request.requesterId,
        type: 'RETURN_REMINDER',
        title: 'Return reminder',
        message: `Please return "${request.itemName}" by tomorrow`,
        relatedId: request._id,
        relatedType: 'CommunityRequest',
      });
    }

    console.log(`Sent ${endingSoon.length * 2} return reminders`);
  } catch (error) {
    console.error('Return reminder creation failed:', error.message);
  }
};