const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    match: [/^[6-9]\d{9}$/, 'Invalid phone number']
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },

  role: {
    type: String,
    enum: ['household', 'ngo', 'recycler', 'admin'],
    default: 'household'
  },

  address: {
    street: String,
    locality: String,
    city: String,
    state: String,
    pincode: {
      type: String,
      match: [/^\d{6}$/, 'Invalid pincode']
    }
  },

  organizationDetails: {
    name: String,
    registrationNumber: String
  },

  isProfileComplete: {
    type: Boolean,
    default: false
  },

  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  }

}, { timestamps: true });

// 🔐 password hash
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔑 compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ SAFE profile completion check (FIXED)
userSchema.methods.checkProfileCompletion = function () {
  const hasBasicInfo =
    !!this.name &&
    !!this.email &&
    !!this.address?.locality &&
    !!this.address?.pincode;

  if (this.role === 'ngo' || this.role === 'recycler') {
    this.isProfileComplete =
      hasBasicInfo && !!this.organizationDetails?.name;
  } else {
    this.isProfileComplete = hasBasicInfo;
  }

  return this.isProfileComplete;
};

module.exports = mongoose.model('User', userSchema);
