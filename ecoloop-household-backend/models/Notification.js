const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recyclerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recycler',
      required: true
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ['REQUEST_ACCEPTED', 'STATUS_UPDATE', 'NEW_REQUEST', 'SYSTEM'],
      default: 'SYSTEM'
    },

    // Optional: store related data
    data: {
      recycleId: String,
      category: String,
      quantity: Number,
      unit: String,
      location: String
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
