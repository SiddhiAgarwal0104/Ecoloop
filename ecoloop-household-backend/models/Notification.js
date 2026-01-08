const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recyclerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recycler',
    default: null
  },
  type: {
    type: String,
    enum: [
      'DONATION_ACCEPTED',
      'DONATION_STATUS_UPDATE',
      'DONATION_PICKED_UP',
      'DONATION_COMPLETED',
      'REQUEST_ACCEPTED',
      'STATUS_UPDATE',
      'NEW_REQUEST',
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
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    default: null
  },
  recycleId: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  data: {
    category: String,
    quantity: Number,
    unit: String,
    location: String
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ recyclerId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);