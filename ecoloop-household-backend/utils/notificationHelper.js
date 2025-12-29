const Notification = require('../models/Notification');

exports.createNotification = async (userId, message, type = 'GENERAL', relatedId = null, relatedModel = null) => {
  try {
    const notification = await Notification.create({
      userId,
      message,
      type,
      relatedId,
      relatedModel
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
