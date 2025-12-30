const mongoose = require('mongoose');

const lendingRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    localityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Locality',
      required: [true, 'Locality ID is required']
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters']
    },
    category: {
      type: String,
      enum: ['tools', 'appliances', 'furniture', 'books', 'sports', 'others'],
      default: 'others'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    },
    createdDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    completionDate: {
      type: Date,
      default: null
    },
    imageUrl: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
lendingRequestSchema.index({ localityId: 1, status: 1 });
lendingRequestSchema.index({ userId: 1, status: 1 });
lendingRequestSchema.index({ createdDate: -1 });
lendingRequestSchema.index({ localityId: 1, createdDate: -1 });

module.exports = mongoose.model('LendingRequest', lendingRequestSchema);
