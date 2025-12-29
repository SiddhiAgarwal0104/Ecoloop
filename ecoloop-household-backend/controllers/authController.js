const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/appError');

// @desc    Register household user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, locality, address, latitude, longitude } = req.body;

    // Validate required fields
    if (!name || !email || !password || !locality || !address || !latitude || !longitude) {
      return next(new AppError('Please provide all required fields', 400));
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    // Create user with HOUSEHOLD role only
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'HOUSEHOLD',
      locality,
      address,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    });

    // Generate token
    const token = generateToken(user._id, user.role, user.locality);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          locality: user.locality,
          address: user.address,
          location: user.location
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Generate token
    const token = generateToken(user._id, user.role, user.locality);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          locality: user.locality,
          address: user.address,
          location: user.location
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          locality: user.locality,
          address: user.address,
          location: user.location
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
