const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityRequest',
      required: true,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['requester', 'lender'],
          required: true,
        },
      },
    ],
    lenderConfirmed: {
      type: Boolean,
      default: false,
    },
    borrowerConfirmed: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
chatRoomSchema.index({ requestId: 1 });
chatRoomSchema.index({ 'participants.userId': 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);