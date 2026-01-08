const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Recycler Schema
 * Represents a recycler user in the EcoLoop system
 * Stores profile info, statistics, ratings, and contact details
 */

const recyclerSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    default: null
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },

  phone: {
    type: String,
    trim: true,
    sparse: true
  },

  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },

  // Location Information
  address: {
    type: String,
    trim: true
  },

  city: {
    type: String,
    trim: true,
    index: true // Index for city-based admin routing
  },

  locality: {
    type: String,
    trim: true,
    index: true // Index for faster locality-based queries
  },

  latitude: {
    type: Number,
    min: -90,
    max: 90,
    default: null
  },

  longitude: {
    type: Number,
    min: -180,
    max: 180,
    default: null
  },

  location: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },

  // Profile Information
  profilePicture: {
    type: String,
    default: null
  },

  profileImage: {
    type: String,
    default: null
  },

  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio must not exceed 500 characters'],
    default: null
  },

  // Verification & Status
  isVerified: {
    type: Boolean,
    default: false
  },

  profileCompleted: {
    type: Boolean,
    default: false
  },

  role: {
    type: String,
    enum: ['RECYCLER'],
    default: 'RECYCLER'
  },

  verificationStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },

  verificationRejectionReason: {
    type: String,
    default: null
  },

  verificationRequestedAt: {
    type: Date,
    default: Date.now
  },

  verificationApprovedAt: {
    type: Date,
    default: null
  },

  verificationApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  // Performance Metrics
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5']
  },

  totalRequests: {
    type: Number,
    default: 0,
    min: 0
  },

  completedRequests: {
    type: Number,
    default: 0,
    min: 0
  },

  totalWasteCollected: {
    type: Number,
    default: 0,
    min: 0 // In KG
  },

  // Reviews
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecyclerReview'
    }
  ],

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
 * Virtual: Completion Rate
 * Calculates percentage of completed requests
 */
recyclerSchema.virtual('completionRate').get(function () {
  if (this.totalRequests === 0) return 0;
  return parseFloat(((this.completedRequests / this.totalRequests) * 100).toFixed(2));
});

/**
 * Index for faster queries
 * Combines commonly used filters
 */
recyclerSchema.index({ email: 1, isActive: 1 });
recyclerSchema.index({ locality: 1, isActive: 1 });
recyclerSchema.index({ rating: -1 });

/**
 * Middleware: Hash password before saving
 * Only hashes if password field is modified
 */
recyclerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(`✅ Password hashed for recycler: ${this.email}`);
    next();
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    next(error);
  }
});

/**
 * Method: Compare password
 * Compares entered password with hashed password
 * @param {string} enteredPassword - Password to compare
 * @returns {Promise<boolean>} True if passwords match
 */
recyclerSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('❌ Password comparison error:', error);
    return false;
  }
};

/**
 * Method: Get public profile (without sensitive data)
 * @returns {object} Public recycler profile
 */
recyclerSchema.methods.getPublicProfile = function () {
  const profile = this.toObject();
  delete profile.password;
  return profile;
};

module.exports = mongoose.model('Recycler', recyclerSchema);
