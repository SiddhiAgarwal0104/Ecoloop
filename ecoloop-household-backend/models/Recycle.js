const mongoose = require('mongoose');

const recycleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    trim: true
  },
  userPhone: {
    type: String,
    trim: true
  },
  wasteCategory: {
    type: String,
    required: [true, 'Waste category is required'],
    enum: ['PLASTIC', 'PAPER', 'METAL', 'GLASS', 'E_WASTE', 'ORGANIC', 'MIXED'],
    trim: true
  },
  wasteType: {
    type: String,
    required: [true, 'Waste type is required'],
    enum: ['SEGREGATED', 'MIXED'],
    default: 'SEGREGATED'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.1, 'Quantity must be at least 0.1']
  },
  unit: {
    type: String,
    enum: ['KG', 'PIECES', 'ITEMS', 'BAGS'],
    default: 'KG'
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  aiDetectedWasteType: {
    type: String,
    enum: ['PLASTIC', 'PAPER', 'METAL', 'GLASS', 'E_WASTE', 'ORGANIC', 'HAZARDOUS', 'UNKNOWN', null],
    default: null
  },
  aiDetectionResult: {
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    recyclable: {
      type: Boolean,
      default: false
    },
    detectedItems: [{
      name: String,
      confidence: Number,
      type: String
    }],
    tips: [String]
  },
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
    enum: ['AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'RECYCLED'],
    default: 'AVAILABLE'
  },
  assignedRecycler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recycler',
    default: null
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  pickedUpAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
recycleSchema.index({ userId: 1, status: 1 });
recycleSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Recycle', recycleSchema);
