const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false }, // null for global notification
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'success', 'action'], default: 'info' },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

notificationSchema.statics.forUser = function (userId, unreadOnly = false) {
  const query = { $or: [{ user: userId ? new mongoose.Types.ObjectId(userId) : null }, { user: null }] };
  if (unreadOnly) query.isRead = false;
  return this.find(query).sort('-createdAt');
};

module.exports = mongoose.model('Notification', notificationSchema);
