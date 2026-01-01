const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true,
    enum: [
      '🌱', '🌿', '🌳', '♻️', '🏆', '⭐', '💚', '🎯', 
      '🔥', '💎', '👑', '🌟', '🎖️', '🥇', '🥈', '🥉'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: ['DONATION', 'RECYCLE', 'MILESTONE', 'SPECIAL', 'STREAK']
  },
  tier: {
    type: String,
    required: true,
    enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'],
    default: 'BRONZE'
  },
  points: {
    type: Number,
    required: true,
    default: 10
  },
  requirement: {
    type: {
      type: String,
      enum: ['COUNT', 'STREAK', 'SPECIAL'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    action: {
      type: String,
      enum: ['DONATION', 'RECYCLE', 'CONSECUTIVE_DAYS', 'TOTAL_IMPACT'],
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

badgeSchema.index({ category: 1, tier: 1 });

module.exports = mongoose.model('Badge', badgeSchema);