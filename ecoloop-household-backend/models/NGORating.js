const mongoose = require('mongoose');

const ngoRatingSchema = new mongoose.Schema({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    enum: ['ITEM_RECEIVED', 'DONATION_CANCELLED'],
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

// Prevent duplicate ratings for same donation
ngoRatingSchema.index({ donationId: 1, userId: 1 }, { unique: true });
ngoRatingSchema.index({ ngoId: 1, createdAt: -1 });
ngoRatingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('NGORating', ngoRatingSchema);
