const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
      default: ''
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    googleId: {
      type: String,
      sparse: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin'
    },
    assignedCity: {
      type: String,
      trim: true,
      default: '',
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      match: [/^([0-9]{10})?$/, 'Please provide a valid 10-digit phone number']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
adminSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role,
      email: this.email 
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// Update last login timestamp
adminSchema.methods.updateLastLogin = async function () {
  this.lastLogin = Date.now();
  await this.save({ validateBeforeSave: false });
};

// Instance method to get public profile (without password)
adminSchema.methods.getPublicProfile = function () {
  const admin = this.toObject();
  delete admin.password;
  return admin;
};

module.exports = mongoose.model('Admin', adminSchema);