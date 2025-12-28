// models/BorrowRequest.js

const mongoose = require('mongoose');

const borrowRequestSchema = new mongoose.Schema({
  // Item being requested
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LendItem',
    required: [true, 'Item reference is required']
  },
  
  // Requester details
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester reference is required']
  },
  
  // Owner of the item
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner reference is required']
  },
  
  // Request type
  requestType: {
    type: String,
    enum: ['donate', 'borrow'],
    required: [true, 'Request type is required']
  },
  
  // Quantity requested
  quantityRequested: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  
  // For borrow requests - duration
  borrowDuration: {
    startDate: { type: Date },
    endDate: { type: Date },
    durationDays: { type: Number }
  },
  
  // Request message
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  
  // Purpose (for NGOs/Organizations)
  purpose: {
    type: String,
    trim: true,
    maxlength: [300, 'Purpose cannot exceed 300 characters']
  },
  
  // Request Status Flow
  status: {
    type: String,
    enum: [
      'pending',          // Initial state
      'accepted',         // Owner accepted
      'rejected',         // Owner rejected
      'scheduled',        // Pickup/delivery scheduled
      'in-transit',       // Item picked up/being delivered
      'delivered',        // Item delivered to requester
      'in-use',           // For borrow - item in use
      'return-scheduled', // Return scheduled
      'returned',         // Item returned (for borrow)
      'completed',        // Transaction completed
      'cancelled',        // Cancelled by requester
      'expired'           // Request expired
    ],
    default: 'pending'
  },
  
  // Status history for tracking
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Response from owner
  ownerResponse: {
    respondedAt: { type: Date },
    response: {
      type: String,
      enum: ['accepted', 'rejected', 'pending'],
      default: 'pending'
    },
    rejectionReason: { type: String, trim: true },
    acceptanceNote: { type: String, trim: true }
  },
  
  // Pickup/Delivery details
  handover: {
    method: {
      type: String,
      enum: ['pickup', 'delivery', 'meet-point', null],
      default: null
    },
    scheduledDate: { type: Date },
    scheduledTime: { type: String },
    address: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    specialInstructions: { type: String, trim: true },
    completedAt: { type: Date }
  },
  
  // For borrow - return details
  return: {
    scheduledDate: { type: Date },
    actualReturnDate: { type: Date },
    returnMethod: {
      type: String,
      enum: ['pickup', 'delivery', 'meet-point', null]
    },
    itemCondition: {
      type: String,
      enum: ['same', 'minor-wear', 'damaged', 'lost', null]
    },
    returnNotes: { type: String, trim: true }
  },
  
  // Ratings & Feedback (mutual)
  feedback: {
    byRequester: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: { type: String, trim: true, maxlength: 300 },
      submittedAt: { type: Date }
    },
    byOwner: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: { type: String, trim: true, maxlength: 300 },
      submittedAt: { type: Date }
    }
  },
  
  // Notifications tracking
  notifications: {
    ownerNotified: { type: Boolean, default: false },
    ownerNotifiedAt: { type: Date },
    requesterNotified: { type: Boolean, default: false },
    requesterNotifiedAt: { type: Date },
    remindersSent: { type: Number, default: 0 },
    lastReminderAt: { type: Date }
  },
  
  // Priority (for system use)
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Auto-actions
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days for pending
    }
  },
  
  autoRejectAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    }
  },
  
  // Issues/Disputes
  hasIssue: {
    type: Boolean,
    default: false
  },
  
  issues: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    issueType: {
      type: String,
      enum: ['item-mismatch', 'damage', 'not-delivered', 'late-return', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: { type: Date },
    resolution: String
  }],
  
  // Admin notes (for moderation)
  adminNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
borrowRequestSchema.index({ item: 1, status: 1 });
borrowRequestSchema.index({ requester: 1, status: 1 });
borrowRequestSchema.index({ owner: 1, status: 1 });
borrowRequestSchema.index({ status: 1, expiresAt: 1 });
borrowRequestSchema.index({ createdAt: -1 });

// Virtual for checking if request is active
borrowRequestSchema.virtual('isActive').get(function() {
  return ['pending', 'accepted', 'scheduled', 'in-transit', 'delivered', 'in-use'].includes(this.status);
});

// Virtual for calculating days until expiry
borrowRequestSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiresAt) return null;
  const days = Math.ceil((this.expiresAt - new Date()) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
});

// Pre-save middleware
borrowRequestSchema.pre('save', async function() {
  // Add to status history if status changed
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  
  // Check expiry
  if (this.status === 'pending' && new Date() > this.expiresAt) {
    this.status = 'expired';
  }
});

// Method to accept request
borrowRequestSchema.methods.acceptRequest = async function(acceptanceNote = '') {
  this.status = 'accepted';
  this.ownerResponse = {
    respondedAt: new Date(),
    response: 'accepted',
    acceptanceNote
  };
  
  // Update item's available quantity
  const LendItem = mongoose.model('LendItem');
  await LendItem.findByIdAndUpdate(this.item, {
    $inc: { availableQuantity: -this.quantityRequested, totalRequests: 1 }
  });
  
  return await this.save();
};

// Method to reject request
borrowRequestSchema.methods.rejectRequest = async function(rejectionReason = '') {
  this.status = 'rejected';
  this.ownerResponse = {
    respondedAt: new Date(),
    response: 'rejected',
    rejectionReason
  };
  
  return await this.save();
};

// Method to complete transaction
borrowRequestSchema.methods.completeTransaction = async function() {
  this.status = 'completed';
  
  // Update item
  const LendItem = mongoose.model('LendItem');
  await LendItem.findByIdAndUpdate(this.item, {
    $inc: { successfulDonations: 1 }
  });
  
  // Update user stats
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.owner, {
    $inc: { 'stats.itemsDonated': 1 }
  });
  await User.findByIdAndUpdate(this.requester, {
    $inc: { 'stats.itemsBorrowed': 1 }
  });
  
  return await this.save();
};

// Static method to get pending requests for owner
borrowRequestSchema.statics.getPendingForOwner = async function(ownerId) {
  return await this.find({
    owner: ownerId,
    status: 'pending',
    isDeleted: false
  })
  .populate('item', 'title category images')
  .populate('requester', 'name phone address organizationDetails')
  .sort('-createdAt');
};

// Static method to get user's request history
borrowRequestSchema.statics.getUserRequests = async function(userId) {
  return await this.find({
    requester: userId,
    isDeleted: false
  })
  .populate('item', 'title category images')
  .populate('owner', 'name phone address')
  .sort('-createdAt');
};

module.exports = mongoose.model('BorrowRequest', borrowRequestSchema);