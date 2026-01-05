// const mongoose = require('mongoose');

// const notificationSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   type: {
//     type: String,
//     enum: [
//       'DONATION_ACCEPTED',
//       'DONATION_STATUS_UPDATE',
//       'DONATION_PICKED_UP',
//       'DONATION_COMPLETED',
//       'SYSTEM'
//     ],
//     required: true
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   message: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   donationId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Donation',
//     default: null
//   },
//   isRead: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });

// // Index for faster queries
// notificationSchema.index({ userId: 1, isRead: 1 });
// notificationSchema.index({ createdAt: -1 });

// module.exports = mongoose.model('Notification', notificationSchema);

const mongoose = require('mongoose');

/**
 * Household Notification Model
 * For notifications sent to household users
 */
const householdNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'DONATION_ACCEPTED',
      'DONATION_STATUS_UPDATE',
      'DONATION_PICKED_UP',
      'DONATION_COMPLETED',
      'RECYCLE_ACCEPTED',
      'RECYCLE_STATUS_UPDATE',
      'RECYCLE_PICKED_UP',
      'RECYCLE_COMPLETED',
      'REWARD_EARNED',
      'BADGE_UNLOCKED',
      'SYSTEM'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  // Related donation
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    default: null
  },
  // Related recycle request
  recycleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recycle',
    default: null
  },
  // Additional data (optional)
  data: {
    points: Number,
    badgeName: String,
    category: String,
    quantity: Number,
    unit: String
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
householdNotificationSchema.index({ userId: 1, isRead: 1 });
householdNotificationSchema.index({ userId: 1, createdAt: -1 });
householdNotificationSchema.index({ createdAt: -1 });

// Virtual for time since notification
householdNotificationSchema.virtual('timeAgo').get(function() {
  const diff = Date.now() - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Method to mark as read
householdNotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to mark all as read for a user
householdNotificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get unread count
householdNotificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

module.exports = mongoose.model('HouseholdNotification', householdNotificationSchema);