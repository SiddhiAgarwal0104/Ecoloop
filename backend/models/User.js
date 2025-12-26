// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Won't be returned in queries by default
  },
  
  // Role-based access
  role: {
    type: String,
    enum: ['household', 'ngo', 'recycler', 'admin'],
    required: [true, 'Role is required'],
    default: 'household'
  },
  
  // Location Details (for locality-based matching)
  address: {
    street: { type: String, trim: true },
    locality: { 
      type: String, 
      required: [true, 'Locality is required'],
      trim: true 
    },
    city: { 
      type: String, 
      default: 'Delhi',
      trim: true 
    },
    state: { 
      type: String, 
      default: 'Delhi',
      trim: true 
    },
    pincode: { 
      type: String, 
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.2090, 28.6139] // Default Delhi coordinates
      }
    }
  },
  
  // Profile completion & verification
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  
  // NGO/Recycler specific fields (only for those roles)
  organizationDetails: {
    name: { type: String, trim: true },
    registrationNumber: { type: String, trim: true },
    type: { 
      type: String, 
      enum: ['ngo', 'recycler', 'scrap-dealer', 'community-group', null],
      default: null
    },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' }
    },
    acceptedCategories: [{
      type: String,
      enum: ['clothes', 'electronics', 'books', 'furniture', 'toys', 'e-waste', 'plastic', 'metal', 'paper']
    }],
    serviceRadius: { 
      type: Number, 
      default: 5 // in kilometers
    }
  },
  
  // Activity tracking
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  // Gamification & Impact (for future features)
  stats: {
    totalWasteLogged: { type: Number, default: 0 },
    itemsDonated: { type: Number, default: 0 },
    itemsBorrowed: { type: Number, default: 0 },
    co2Saved: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  }

}, { 
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries (locality-based matching)
userSchema.index({ 'address.coordinates': '2dsphere' });
userSchema.index({ 'address.locality': 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ email: 1, phone: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if profile is complete
userSchema.methods.checkProfileCompletion = function() {
  const requiredFields = ['name', 'email', 'phone', 'address.locality', 'address.pincode'];
  
  let isComplete = true;
  requiredFields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    if (!value) isComplete = false;
  });
  
  // Additional check for NGO/Recycler
  if (this.role === 'ngo' || this.role === 'recycler') {
    if (!this.organizationDetails?.name || 
        !this.organizationDetails?.type ||
        this.organizationDetails?.acceptedCategories?.length === 0) {
      isComplete = false;
    }
  }
  
  this.isProfileComplete = isComplete;
  return isComplete;
};

module.exports = mongoose.model('User', userSchema);