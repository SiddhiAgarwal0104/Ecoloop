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
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // ✅ Password by default return nahi hoga
  },
  role: {
    type: String,
    enum: ['HOUSEHOLD', 'NGO', 'RECYCLER'],
    default: 'HOUSEHOLD'
  },
  // ✅ ADD THESE FIELDS
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    lowercase: true
  },
  locality: {
    type: String,
    required: [true, 'Locality is required'],
    trim: true,
    lowercase: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true
  },
  // END OF NEW FIELDS
  address: {
    type: String,
    default: 'NA',
    //required: [true, 'Address is required'],
    trim: true
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    }
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
userSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);