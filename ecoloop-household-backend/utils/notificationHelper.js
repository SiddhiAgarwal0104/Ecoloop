const Notification = require('../models/Notification');

exports.createNotification = async ({ userId, title, message, type = 'GENERAL', relatedId = null, relatedType = null }) => {
  try {
    const notification = await Notification.create({
      userId,
      title: title || type,
      message,
      type,
      relatedId,
      relatedModel: relatedType
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};