const mongoose = require('mongoose');

/**
 * RecyclerReview Schema
 * Stores ratings and reviews for recyclers from households
 * Used for recycler reputation management
 */

const recyclerReviewSchema = new mongoose.Schema({
  // Recycler being reviewed
  recyclerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recycler',
    required: [true, 'Recycler ID is required'],
    index: true
  },

  // Household providing the review
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Household ID is required']
  },

  // Rating Score
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },

  // Review Comment
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },

  // Reference to the request
  requestId: {
    type: String,
    sparse: true
  },

  // Review Status
  isVerified: {
    type: Boolean,
    default: false
  },

  // Helpful votes
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
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
  timestamps: true
});

/**
 * Index for recycler's reviews
 * Used for aggregating ratings
 */
recyclerReviewSchema.index({ recyclerId: 1, createdAt: -1 });

/**
 * Prevent duplicate reviews from same household for same request
 */
recyclerReviewSchema.index({ recyclerId: 1, householdId: 1, requestId: 1 }, { unique: true, sparse: true });

/**
 * Middleware: Prevent review modification
 * Reviews should be immutable after creation
 */
recyclerReviewSchema.pre('save', function (next) {
  if (!this.isNew) {
    const error = new Error('Reviews cannot be modified after creation');
    error.statusCode = 400;
    return next(error);
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RecyclerReview', recyclerReviewSchema);
