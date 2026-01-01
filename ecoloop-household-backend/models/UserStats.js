const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  donations: {
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 }
  },
  recycles: {
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    totalWeight: { type: Number, default: 0 }
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivity: { type: Date, default: null }
  },
  badgesEarned: {
    type: Number,
    default: 0
  },
  rank: {
    locality: { type: Number, default: null },
    global: { type: Number, default: null }
  },
  impactScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for leaderboard queries
userStatsSchema.index({ totalPoints: -1 });
userStatsSchema.index({ impactScore: -1 });
userStatsSchema.index({ level: -1 });

module.exports = mongoose.model('UserStats', userStatsSchema);