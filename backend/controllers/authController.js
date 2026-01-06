const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/appError');

// ===============================
// REGISTER USER
// ===============================
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      city,
      locality,
      pincode,
      latitude,
      longitude,
    } = req.body;

    console.log('📍 Registration Data:', {
      name,
      email,
      city,
      locality,
      pincode,
      latitude,
      longitude,
    });

    // ✅ VALIDATION: Check required fields including latitude and longitude
    if (!name || !email || !password || !city || !locality || !pincode || latitude === undefined || longitude === undefined) {
      return next(new AppError('Please provide all required fields including location (latitude & longitude)', 400));
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      return next(new AppError('Latitude and longitude must be valid numbers', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'HOUSEHOLD',

      city: city.toLowerCase().trim(),
      locality: locality.toLowerCase().trim(),
      pincode: pincode.toString().trim(),

      // ✅ STORE LOCATION COORDINATES
      address: 'NA',
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });

    console.log('✅ User created with location:', {
      userId: user._id,
      location: user.location,
    });

    const token = generateToken({
      id: user._id,
      role: user.role,
      city: user.city,
      locality: user.locality,
      pincode: user.pincode,
    });

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    next(error);
  }
};

// ===============================
// LOGIN USER
// ===============================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return next(new AppError('Invalid credentials', 401));
    }

    // ✅ Generate token with CITY
    const token = generateToken({
      id: user._id,
      role: user.role,
      city: user.city,
      locality: user.locality,
      pincode: user.pincode,
    });

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
          city: user.city,
          locality: user.locality,
          pincode: user.pincode,
          address: user.address,
          location: user.location,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// GET LOGGED-IN USER
// ===============================
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
          city: user.city,
          locality: user.locality,
          pincode: user.pincode,
          address: user.address,
          location: user.location,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// UPDATE USER PROFILE
// ===============================
exports.updateProfile = async (req, res, next) => {
  try {
    const { city, locality, pincode, latitude, longitude } = req.body;

    const updateData = {};

    if (city) updateData.city = city.toLowerCase().trim();
    if (locality) updateData.locality = locality.toLowerCase().trim();
    if (pincode) updateData.pincode = pincode.toString().trim();
    
    if (latitude !== undefined && longitude !== undefined) {
      if (isNaN(latitude) || isNaN(longitude)) {
        return next(new AppError('Latitude and longitude must be valid numbers', 400));
      }
      updateData.location = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };
      console.log('📍 Updating user location:', updateData.location);
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    console.log('✅ Profile updated:', {
      userId: user._id,
      location: user.location,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          city: user.city,
          locality: user.locality,
          pincode: user.pincode,
          address: user.address,
          location: user.location,
        },
      },
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    next(error);
  }
};
