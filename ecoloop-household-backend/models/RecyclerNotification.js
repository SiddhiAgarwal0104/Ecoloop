const mongoose = require('mongoose');

/**
 * Recycler Notification Model
 * For notifications sent to recycler users
 */
const recyclerNotificationSchema = new mongoose.Schema({
  recyclerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recycler',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'NEW_REQUEST',           // New recycle request available in area
      'REQUEST_ACCEPTED',      // Recycler accepted a request
      'STATUS_UPDATE',         // Status changed (picked up, completed)
      'PAYMENT_RECEIVED',      // Payment notification
      'RATING_RECEIVED',       // User rated the service
      'SYSTEM',                // System notifications
      'NEARBY_REQUEST'         // Request nearby recycler's location
    ],
    required: true,
    default: 'SYSTEM'
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
  // Related recycle request
  recycleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recycle',
    default: null
  },
  // Additional structured data
  data: {
    recycleId: String,
    category: String,
    quantity: Number,
    unit: String,
    location: String,
    distance: Number,        // Distance in km
    householdName: String,
    householdPhone: String,
    estimatedValue: Number,  // Estimated payment
    rating: Number
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  // Priority level
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
recyclerNotificationSchema.index({ recyclerId: 1, isRead: 1 });
recyclerNotificationSchema.index({ recyclerId: 1, createdAt: -1 });
recyclerNotificationSchema.index({ recyclerId: 1, priority: -1, createdAt: -1 });
recyclerNotificationSchema.index({ createdAt: -1 });

// Virtual for time since notification
recyclerNotificationSchema.virtual('timeAgo').get(function() {
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
recyclerNotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to mark all as read for a recycler
recyclerNotificationSchema.statics.markAllAsRead = function(recyclerId) {
  return this.updateMany(
    { recyclerId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get unread count
recyclerNotificationSchema.statics.getUnreadCount = function(recyclerId) {
  return this.countDocuments({ recyclerId, isRead: false });
};

// Static method to delete old read notifications (cleanup)
recyclerNotificationSchema.statics.deleteOldNotifications = function(recyclerId, daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    recyclerId,
    isRead: true,
    readAt: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model('RecyclerNotification', recyclerNotificationSchema);