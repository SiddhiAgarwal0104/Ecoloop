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
      address,
      latitude,
      longitude,
    } = req.body;

    // ✅ Validation
    if (
      !name ||
      !email ||
      !password ||
      !city ||
      !locality ||
      !pincode ||
      !address ||
      !latitude ||
      !longitude
    ) {
      return next(new AppError('Please provide all required fields', 400));
    }

    // ✅ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    // ✅ Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'HOUSEHOLD',

      // 🔥 NORMALIZED LOCATION DATA
      city: city.toLowerCase().trim(),
      locality: locality.toLowerCase().trim(),
      pincode: pincode.toString().trim(),

      address,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });

    // ✅ Generate token (CITY INCLUDED)
    const token = generateToken({
      id: user._id,
      role: user.role,
      city: user.city,
      locality: user.locality,
      pincode: user.pincode,
    });

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
