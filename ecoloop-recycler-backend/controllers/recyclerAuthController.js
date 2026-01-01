const Recycler = require('../models/Recycler');
const { generateToken, decodeToken } = require('../utils/generateToken');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const AppError = require('../utils/appError');

/**
 * Register a new recycler
 * @route POST /api/recycler/auth/register
 * @param {Object} req - Express request object
 * @param {string} req.body.email - Recycler email
 * @param {string} req.body.password - Recycler password (min 6 chars)
 * @param {string} req.body.name - Recycler full name
 * @param {string} req.body.phone - Contact phone number
 * @returns {Object} Success response with token and user data
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, passwordConfirm } = req.body;

    console.log('📥 Register payload:', {
      email,
      password,
      passwordConfirm
    });

    // Validation
    if (!email || !password || !passwordConfirm) {
      return next(new AppError('Please provide email and password', 400));
    }

    if (password !== passwordConfirm) {
      return next(new AppError('Passwords do not match', 400));
    }

    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    const existingRecycler = await Recycler.findOne({ email: email.toLowerCase() });
    if (existingRecycler) {
      return next(new AppError('Email already registered', 409));
    }

    const recycler = new Recycler({
      email: email.toLowerCase(),
      password
    });

    await recycler.save();

    const token = generateToken(recycler._id, 'RECYCLER');

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: recycler.getPublicProfile()
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    next(error);
  }
};


/**
 * Login recycler
 * @route POST /api/recycler/auth/login
 * @param {Object} req - Express request object
 * @param {string} req.body.email - Recycler email
 * @param {string} req.body.password - Recycler password
 * @returns {Object} Success response with token and user data
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find recycler and verify password
    const recycler = await Recycler.findOne({ email: email.toLowerCase() }).select('+password');

    if (!recycler || !(await recycler.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    console.log(`✅ Recycler login: ${recycler.email}`);

    // Generate token
    const token = generateToken(recycler._id, 'RECYCLER');

    // Return response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: recycler.getPublicProfile()
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    next(error);
  }
};

/**
 * Get current recycler profile
 * @route GET /api/recycler/auth/profile
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Recycler ID from token
 * @returns {Object} Recycler profile data
 */
exports.getProfile = async (req, res, next) => {
  try {
    const recycler = await Recycler.findById(req.user.id);

    if (!recycler) {
      return next(new AppError('Recycler not found', 404));
    }

    console.log(`✅ Profile retrieved for: ${recycler.email}`);

    res.status(200).json({
      success: true,
      user: recycler.getPublicProfile()
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    next(error);
  }
};

/**
 * Update recycler profile
 * @route PUT /api/recycler/auth/profile
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Recycler ID from token
 * @param {Object} req.body - Profile update fields
 * @returns {Object} Updated profile data
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, latitude, longitude, bio, profileImage } = req.body;
    
    console.log('📝 Profile update request received');
    console.log('   Body:', { name, phone, address, latitude, longitude, bio, profileImage: !!req.file });
    console.log('   File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');

    // Find recycler
    const recycler = await Recycler.findById(req.user.id);
    if (!recycler) {
      return next(new AppError('Recycler not found', 404));
    }

    // Update allowed fields
    if (name !== undefined && name !== '') recycler.name = name;
    if (phone !== undefined && phone !== '') recycler.phone = phone;
    if (address !== undefined && address !== '') recycler.address = address;
    if (bio !== undefined && bio !== '') recycler.bio = bio;

    // Update location if provided (with proper validation)
    if (latitude !== undefined && latitude !== '' && latitude !== 'NaN' && 
        longitude !== undefined && longitude !== '' && longitude !== 'NaN') {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      console.log(`📍 Saving location - Raw latitude: ${latitude}, Raw longitude: ${longitude}`);
      console.log(`   Parsed: latitude: ${lat}, longitude: ${lng}`);
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        // Store as simple fields for easy access
        recycler.latitude = lat;
        recycler.longitude = lng;
        
        // Also store in nested location object for GeoJSON support
        recycler.location = {
          latitude: lat,
          longitude: lng
        };
        
        console.log(`✅ Location updated: (${lat}, ${lng})`);
      } else {
        console.log('❌ Invalid coordinates provided - values out of range or NaN');
        return next(new AppError('Invalid location coordinates', 400));
      }
    } else {
      console.warn(`⚠️ Latitude or longitude not provided - latitude: "${latitude}", longitude: "${longitude}"`);
    }

    // Handle profile image upload
    if (req.file) {
      try {
        // Delete old image if exists
        if (recycler.profileImage) {
          await deleteFromCloudinary(recycler.profileImage);
        }

        // Upload new image
        const uploadResult = await uploadToCloudinary(req.file, 'recycler-profiles');
        recycler.profileImage = uploadResult.secure_url;
        console.log(`📤 Profile image uploaded for recycler ${recycler._id}`);
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        return next(new AppError('Failed to upload image', 500));
      }
    }

    await recycler.save();
    console.log(`✅ Profile updated for recycler: ${recycler.email}`);
    console.log(`   Saved data - name: ${recycler.name}, phone: ${recycler.phone}, latitude: ${recycler.latitude}, longitude: ${recycler.longitude}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: recycler.getPublicProfile()
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    next(error);
  }
};

/**
 * Change password
 * @route PUT /api/recycler/auth/change-password
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Recycler ID from token
 * @param {string} req.body.currentPassword - Current password
 * @param {string} req.body.newPassword - New password
 * @returns {Object} Success message
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new AppError('Please provide all password fields', 400));
    }

    if (newPassword !== confirmPassword) {
      return next(new AppError('New passwords do not match', 400));
    }

    if (newPassword.length < 6) {
      return next(new AppError('New password must be at least 6 characters', 400));
    }

    // Find recycler
    const recycler = await Recycler.findById(req.user.id).select('+password');
    if (!recycler) {
      return next(new AppError('Recycler not found', 404));
    }

    // Verify current password
    if (!(await recycler.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Update password
    recycler.password = newPassword;
    await recycler.save();

    console.log(`✅ Password changed for recycler: ${recycler.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    next(error);
  }
};

/**
 * Logout recycler (client-side token deletion)
 * @route POST /api/recycler/auth/logout
 * @returns {Object} Success message
 */
exports.logout = async (req, res, next) => {
  try {
    console.log(`✅ Recycler logout: ${req.user.email || 'Unknown'}`);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    next(error);
  }
};






