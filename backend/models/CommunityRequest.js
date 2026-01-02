const mongoose = require('mongoose');

const communityRequestSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics',
        'Tools',
        'Sports',
        'Books',
        'Furniture',
        'Vehicles',
        'Clothing',
        'Kitchen',
        'Garden',
        'Other',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    locality: {
      type: String,
      required: [true, 'Locality is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode'],
    },
    location: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: ['OPEN', 'NEGOTIATING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'OPEN',
    },
    handedOverAt: {
      type: Date,
      default: null,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient locality-based queries
communityRequestSchema.index({ locality: 1, pincode: 1, status: 1 });
communityRequestSchema.index({ requesterId: 1 });
communityRequestSchema.index({ acceptedBy: 1 });

module.exports = mongoose.model('CommunityRequest', communityRequestSchema);