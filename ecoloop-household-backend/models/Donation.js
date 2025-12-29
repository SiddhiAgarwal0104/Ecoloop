const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemCategory: {
    type: String,
    required: [true, 'Item category is required'],
    enum: ['CLOTHES', 'FOOD', 'BOOKS', 'ELECTRONICS', 'FURNITURE', 'TOYS', 'OTHER'],
    trim: true
  },
  condition: {
    type: String,
    required: [true, 'Item condition is required'],
    enum: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'USED'],
    default: 'GOOD'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  pickupLocation: {
    address: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    }
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'COMPLETED'],
    default: 'AVAILABLE'
  },
  assignedNGO: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
donationSchema.index({ userId: 1, status: 1 });
donationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Donation', donationSchema);
