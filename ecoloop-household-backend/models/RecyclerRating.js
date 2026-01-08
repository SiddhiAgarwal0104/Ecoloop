const mongoose = require('mongoose');

const recyclerRatingSchema = new mongoose.Schema({
  recycleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recycle',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recyclerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recycler',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  ratingType: {
    type: String,
    enum: ['PICKUP_COMPLETED', 'REQUEST_CANCELLED'],
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent duplicate ratings for same recycle request
recyclerRatingSchema.index({ recycleId: 1, userId: 1 }, { unique: true });
recyclerRatingSchema.index({ recyclerId: 1, createdAt: -1 });
recyclerRatingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('RecyclerRating', recyclerRatingSchema);
