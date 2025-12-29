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
    // ⭐ Password NOT required for Google sign-in users
    required: function() {
      return !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['HOUSEHOLD', 'NGO', 'RECYCLER'],
    default: 'HOUSEHOLD'
  },
  locality: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  location: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  // ⭐ NEW: Google OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true  // Allows null values for non-Google users
  },
  profilePicture: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  }
}, {
  timestamps: true
});

// Hash password before saving (only for local auth)
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

module.exports = mongoose.model('User', userSchema);
