const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, address, organizationDetails } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone is required'
      });
    }

    const query = [];
    if (email) query.push({ email });
    if (phone) query.push({ phone });

    const existingUser = await User.findOne({ $or: query });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          email && existingUser.email === email
            ? 'Email already registered'
            : 'Phone number already registered'
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      address
    });

    if (typeof user.checkProfileCompletion === 'function') {
      user.checkProfileCompletion();
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Additional auth handlers appended to complete exports
// (login, getMe, updateProfile, changePassword, logout)
exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) return res.status(400).json({ success:false, message: 'Please provide email/phone and password' });

    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }], accountStatus: 'active' }).select('+password');
    if (!user) return res.status(401).json({ success:false, message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success:false, message: 'Invalid credentials' });

    user.lastLogin = new Date(); await user.save();
    const token = generateToken(user._id);
    res.status(200).json({ success:true, message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, address: user.address, organizationDetails: user.organizationDetails, isProfileComplete: user.isProfileComplete, stats: user.stats } });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success:false, message:'Login failed', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success:true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, address: user.address, organizationDetails: user.organizationDetails, isProfileComplete: user.isProfileComplete, isVerified: user.isVerified, stats: user.stats, createdAt: user.createdAt } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success:false, message:'Failed to fetch profile', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, address, organizationDetails } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success:false, message:'User not found' });

    if (name) user.name = name;
    if (address) user.address = { ...user.address.toObject(), ...address };
    if (organizationDetails && (user.role === 'ngo' || user.role === 'recycler')) user.organizationDetails = { ...user.organizationDetails.toObject(), ...organizationDetails };

    user.checkProfileCompletion(); await user.save();
    res.status(200).json({ success:true, message:'Profile updated successfully', user: { id: user._id, name: user.name, address: user.address, organizationDetails: user.organizationDetails, isProfileComplete: user.isProfileComplete } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success:false, message:'Failed to update profile', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success:false, message:'Please provide current and new password' });

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success:false, message:'Current password is incorrect' });

    user.password = newPassword; await user.save();
    res.status(200).json({ success:true, message:'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success:false, message:'Failed to change password', error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.status(200).json({ success:true, message:'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success:false, message:'Logout failed' });
  }
};