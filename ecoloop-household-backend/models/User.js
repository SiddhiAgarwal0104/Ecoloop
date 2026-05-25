const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
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
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['HOUSEHOLD', 'NGO', 'RECYCLER', 'ADMIN'],
    default: 'HOUSEHOLD'
  },

  // ── ADDED: Email OTP verification status ──────────────────────────────────
  isEmailVerified: {
    type: Boolean,
    default: false   // set to true after OTP confirmed; Google users skip OTP
  },
  // ─────────────────────────────────────────────────────────────────────────

  isVerified: {
    type: Boolean,
    default: function() {
      // NGOs are unverified by default, others are verified
      return this.role !== 'NGO';
    }
  },
  verificationRejectionReason: {
    type: String,
    default: null
  },
  verificationRequestedAt: {
    type: Date
  },
  verificationApprovedAt: {
    type: Date
  },
  verificationApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  locality: {
    type: String,
    trim: true,
    default: 'Not Set'
  },
  city: {
    type: String,
    trim: true,
    default: 'Not Set'
  },
  pincode: {
    type: String,
    trim: true,
    default: 'Not Set'
  },
  address: {
    type: String,
    trim: true,
    default: 'Not Set'
  },
  location: {
    type: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    default: null
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  profilePicture: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual to check if profile is complete
userSchema.virtual('isProfileComplete').get(function () {
  if (this.role === 'NGO') {
    return (
      this.locality?.trim() &&
      this.address?.trim() &&
      this.location &&
      typeof this.location.latitude === 'number' &&
      typeof this.location.longitude === 'number'
    );
  }

  return (
    this.locality?.trim() &&
    this.address?.trim()
  );
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);