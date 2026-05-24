const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const AppError = require('../utils/appError');

/**
 * NGO Authentication Controller
 * Handles NGO-specific auth operations including profile completion
 */

/**
 * Get NGO profile
 * @route GET /api/ngo/auth/profile
 * @access Private
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user: user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update NGO profile
 * @route PUT /api/ngo/auth/profile
 * @access Private
 * @body {string} phone - Phone number (optional)
 * @body {string} city - City (required)
 * @body {string} locality - Locality (required)
 * @body {string} address - Address (required)
 * @body {number} latitude - Location latitude (for map)
 * @body {number} longitude - Location longitude (for map)
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { phone, city, locality, address, latitude, longitude } = req.body;

    console.log('📝 [NGO Profile Update] Request received');
    console.log('   User ID:', req.user.id);
    console.log('   Body:', { phone, city, locality, address, latitude, longitude });

    // Find NGO user
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Verify user is NGO
    if (user.role !== 'NGO') {
      return next(new AppError('This endpoint is for NGO users only', 403));
    }

    // Update allowed fields
    if (phone !== undefined && phone.trim() !== '') user.phone = phone.trim();
    if (city !== undefined && city.trim() !== '') user.city = city.trim();
    if (locality !== undefined && locality.trim() !== '') user.locality = locality.trim();
    if (address !== undefined && address.trim() !== '') user.address = address.trim();

    // Update location if provided
    if (latitude !== undefined && latitude !== '' && latitude !== 'NaN' && 
        longitude !== undefined && longitude !== '' && longitude !== 'NaN') {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      console.log('📍 Processing location:', { latitude, longitude, lat, lng });
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        user.location = {
          latitude: lat,
          longitude: lng
        };
        console.log('✅ Location saved:', user.location);
      } else {
        console.log('❌ Invalid coordinates');
        return next(new AppError('Invalid location coordinates', 400));
      }
    }

    // ✅ CHECK IF NGO PROFILE IS NOW COMPLETE
    const isProfileComplete = 
      user.city && 
      user.city.trim() !== '' &&
      user.locality && 
      user.locality.trim() !== '' &&
      user.address && 
      user.address.trim() !== '' &&
      user.location &&
      typeof user.location.latitude === 'number' &&
      typeof user.location.longitude === 'number';

    console.log('🔍 NGO Profile completion check:', {
      city: !!user.city,
      locality: !!user.locality,
      address: !!user.address,
      hasLocation: !!user.location,
      isComplete: isProfileComplete
    });

    if (isProfileComplete) {
      user.profileCompleted = true;
      
      // ✅ SUBMIT FOR ADMIN VERIFICATION
      if (!user.verificationRequestedAt) {
        user.isVerified = false;
        user.verificationRequestedAt = new Date();
        
        console.log('📬 [NGO Verification] Profile completed - submitting for admin verification:', {
          ngoId: user._id,
          ngoName: user.name,
          city: user.city,
          locality: user.locality,
          requestedAt: user.verificationRequestedAt
        });
      }
    } else {
      console.log('📋 NGO Profile incomplete. Missing:', {
        city: !user.city,
        locality: !user.locality,
        address: !user.address,
        location: !user.location
      });
    }

    await user.save();

    console.log('✅ NGO Profile saved:', {
      city: user.city,
      locality: user.locality,
      profileCompleted: user.profileCompleted,
      isVerified: user.isVerified
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user
      }
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    next(error);
  }
};

/**
 * Change password for NGO
 * @route PUT /api/ngo/auth/change-password
 * @access Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new AppError('All password fields are required', 400));
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return next(new AppError('Current password is incorrect', 401));
    }

    if (newPassword !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    if (newPassword.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('✅ NGO password changed');

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout NGO
 * @route POST /api/ngo/auth/logout
 * @access Private
 */
exports.logout = async (req, res, next) => {
  try {
    console.log('👋 NGO logged out');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};
