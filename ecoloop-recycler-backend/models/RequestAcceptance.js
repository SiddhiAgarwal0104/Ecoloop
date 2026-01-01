const mongoose = require('mongoose');

/**
 * RequestAcceptance Schema
 * Tracks accepted recycle requests and their lifecycle
 * Links household requests with assigned recyclers
 */

const requestAcceptanceSchema = new mongoose.Schema({
  // Reference to household recycle request
  requestId: {
    type: String,
    required: [true, 'Request ID is required'],
    index: true
  },

  // Household user who created the request
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Household ID is required'],
    index: true
  },

  // Recycler who accepted the request
  recyclerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recycler',
    required: [true, 'Recycler ID is required'],
    index: true
  },

  // Waste Details
  wasteCategory: {
    type: String,
    enum: ['PLASTIC', 'PAPER', 'METAL', 'GLASS', 'E_WASTE', 'ORGANIC', 'MIXED'],
    required: [true, 'Waste category is required'],
    index: true
  },

  wasteType: {
    type: String,
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

  // Pickup Location Details
  pickupLocation: {
    address: {
      type: String,
      trim: true
    },
    latitude: Number,
    longitude: Number
  },

  // Status Tracking
  status: {
    type: String,
    enum: ['ACCEPTED', 'PICKED_UP', 'RECYCLED'],
    default: 'ACCEPTED',
    index: true
  },

  // Timeline
  acceptedAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },

  pickedUpAt: {
    type: Date,
    default: null
  },

  recycledAt: {
    type: Date,
    default: null
  },

  // Additional Information
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Virtual: Time to complete
 * Calculates days taken to complete the request
 */
requestAcceptanceSchema.virtual('daysToComplete').get(function () {
  if (!this.recycledAt) return null;
  const diffTime = Math.abs(this.recycledAt - this.acceptedAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

/**
 * Compound Index for recycler's requests by status
 */
requestAcceptanceSchema.index({ recyclerId: 1, status: 1, createdAt: -1 });

/**
 * Index for request ID lookup
 */
requestAcceptanceSchema.index({ requestId: 1 });

/**
 * Middleware: Update timestamp on save
 */
requestAcceptanceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RequestAcceptance', requestAcceptanceSchema);
