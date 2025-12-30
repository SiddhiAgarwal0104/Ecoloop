const Admin = require('../models/Admin');
const { OAuth2Client } = require('google-auth-library');

/**
 * @desc    Register new admin (Public - email validation required)
 * @route   POST /api/admin/auth/register
 * @access  Public
 */
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, assignedCity } = req.body;

    // Validate name
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid name (minimum 2 characters)'
      });
    }

    // ⚠️ CRITICAL: Only @ecoloop.com email addresses allowed
    // No exceptions - all admins must use company email
    if (!email || !/^[^\s@]+@ecoloop\.com$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Only @ecoloop.com email addresses are allowed. Example: admin@ecoloop.com'
      });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a password'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain a lowercase letter'
      });
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain an uppercase letter'
      });
    }

    if (!/(?=.*\d)/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain a number'
      });
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain a special character (@$!%*?&)'
      });
    }

    // NOTE: City and phone are NOT required during registration
    // They will be filled in on the CompleteProfile page after registration
    // This allows two-step registration flow: Register -> CompleteProfile -> Dashboard

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password,
      phone,
      role: 'admin',
      assignedCity
    });

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: admin.getPublicProfile()
    });
  } catch (error) {
    console.error('Register admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

/**
 * @desc    Admin login
 * @route   POST /api/admin/auth/login
 * @access  Public
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for admin (include password for comparison)
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check if password matches
    const isPasswordMatch = await admin.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await admin.updateLastLogin();

    // Generate token
    const token = admin.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        admin: admin.getPublicProfile(),
        city: admin.assignedCity,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

/**
 * @desc    Get current logged in admin
 * @route   GET /api/admin/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    res.status(200).json({
      success: true,
      data: admin.getPublicProfile()
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Update admin profile
 * @route   PUT /api/admin/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, assignedCity } = req.body;

    // Validate name if provided
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid name (minimum 2 characters)'
      });
    }

    // Validate phone if provided
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone must be 10 digits'
      });
    }

    // Validate city if provided
    if (assignedCity && assignedCity.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid city name'
      });
    }

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name.trim();
    if (phone) fieldsToUpdate.phone = phone;
    if (assignedCity) fieldsToUpdate.assignedCity = assignedCity.trim();

    const admin = await Admin.findByIdAndUpdate(
      req.admin._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: admin.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during update',
      error: error.message
    });
  }
};

/**
 * @desc    Change admin password
 * @route   PUT /api/admin/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    // Get admin with password
    const admin = await Admin.findById(req.admin._id).select('+password');

    // Check current password
    const isPasswordMatch = await admin.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change',
      error: error.message
    });
  }
};

/**
 * @desc    Logout admin
 * @route   POST /api/admin/auth/logout
 * @access  Private
 */
const logoutAdmin = async (req, res) => {
  try {
    // In JWT-based auth, logout is handled on client side by removing token
    // But we can log the action for audit purposes
    console.log(`Admin logged out: ${req.admin.email} at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message
    });
  }
};

/**
 * @desc    Get all admins (Super Admin only)
 * @route   GET /api/admin/auth/admins
 * @access  Private/Super Admin
 */
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Deactivate admin (Super Admin only)
 * @route   PUT /api/admin/auth/deactivate/:id
 * @access  Private/Super Admin
 */
const deactivateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent self-deactivation
    if (admin._id.toString() === req.admin._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    admin.isActive = false;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Login/Register with Google OAuth
 * @route   POST /api/admin/auth/google
 * @access  Public
 */
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    // Verify token with Google
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    // ⚠️ CRITICAL: Even Google OAuth users MUST have @ecoloop.com email
    // No exceptions - enforced at authentication level
    if (!email || !/^[^\s@]+@ecoloop\.com$/.test(email)) {
      return res.status(403).json({
        success: false,
        message: 'Google account must be linked to @ecoloop.com email address. Sign in with your company email.'
      });
    }

    // Check if admin exists
    let admin = await Admin.findOne({ email });

    if (!admin) {
      // Create new admin with Google auth
      // For Google users, we don't require assignedCity upfront
      // They'll need to set it on first login or in profile
      admin = await Admin.create({
        name,
        email,
        googleId,
        phone: '',
        assignedCity: 'Not Set',
        isActive: true
      });
    } else {
      // Update Google ID if not already set
      if (!admin.googleId) {
        admin.googleId = googleId;
        await admin.save();
      }

      // Check if admin is active
      if (!admin.isActive) {
        return res.status(403).json({
          success: false,
          message: 'This admin account has been deactivated'
        });
      }
    }

    // Update last login
    await admin.updateLastLogin();

    // Generate token
    const authToken = admin.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: authToken,
      admin: admin.getPublicProfile()
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getMe,
  updateProfile,
  changePassword,
  logoutAdmin,
  getAllAdmins,
  deactivateAdmin,
  googleLogin
};