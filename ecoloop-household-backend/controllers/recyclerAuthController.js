const Recycler = require('../models/Recycler');
const { generateToken, decodeToken } = require('../utils/generateToken');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const AppError = require('../utils/appError');

/**
 * Register a new recycler
 * @route POST /api/recycler/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, passwordConfirm, name, phone } = req.body;

    console.log('📥 Register payload:', { email, name, phone });

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

    // ✅ CREATE RECYCLER WITH PROFILE INCOMPLETE
    const recycler = new Recycler({
      email: email.toLowerCase(),
      password,
      name: name || '',
      phone: phone || '',
      profileCompleted: false,  // ✅ Profile needs completion
      isVerified: false,        // ✅ Not verified yet
      verificationStatus: 'PENDING',
      verificationRequestedAt: null  // ✅ Will be set after profile completion
    });

    await recycler.save();

    const token = generateToken(recycler._id, 'RECYCLER');

    console.log('✅ Recycler registered:', recycler.email);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please complete your profile.',
      token,
      data: {
        user: {
          ...recycler.getPublicProfile(),
          role: 'RECYCLER',
          profileCompleted: false
        },
        needsProfileCompletion: true  // ✅ Frontend will redirect to profile completion
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    next(error);
  }
};

/**
 * Login recycler
 * @route POST /api/recycler/auth/login
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

    console.log('🔐 Recycler login attempt:', recycler.email);

    // ✅ CHECK 1: Profile completion required
    if (!recycler.profileCompleted) {
      const token = generateToken(recycler._id, 'RECYCLER');
      console.log('⚠️ Recycler profile not completed');
      return res.status(200).json({
        success: true,
        message: 'Please complete your profile',
        token,
        data: {
          user: {
            ...recycler.getPublicProfile(),
            role: 'RECYCLER',
            profileCompleted: false
          },
          needsProfileCompletion: true
        }
      });
    }

    // ✅ CHECK 2: Admin verification required (like NGO)
    if (!recycler.isVerified || recycler.verificationStatus !== 'APPROVED') {
      console.log('⏳ Recycler pending verification:', {
        isVerified: recycler.isVerified,
        verificationStatus: recycler.verificationStatus
      });
      
      return res.status(403).json({
        success: false,
        message: 'Your recycler profile is pending admin verification. You will receive an email once approved.',
        data: {
          isRecyclerPendingVerification: true,
          verificationStatus: recycler.verificationStatus
        }
      });
    }

    // ✅ All checks passed - login successful
    const token = generateToken(recycler._id, 'RECYCLER');

    console.log('✅ Recycler login successful:', recycler.email);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        user: {
          ...recycler.getPublicProfile(),
          role: 'RECYCLER',
          profileCompleted: true
        }
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    next(error);
  }
};

/**
 * Get current recycler profile
 * @route GET /api/recycler/auth/profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const recycler = await Recycler.findById(req.user.id);

    if (!recycler) {
      return next(new AppError('Recycler not found', 404));
    }

    console.log('✅ Profile retrieved for:', recycler.email);

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
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city, locality, latitude, longitude, bio, profileImage } = req.body;
    
    console.log('📝 [Recycler Profile Update] Request received');
    console.log('   User ID:', req.user.id);
    console.log('   Body:', { name, phone, address, city, locality, latitude, longitude });

    // Find recycler
    const recycler = await Recycler.findById(req.user.id);
    if (!recycler) {
      return next(new AppError('Recycler not found', 404));
    }

    // Update allowed fields
    if (name !== undefined && name.trim() !== '') recycler.name = name.trim();
    if (phone !== undefined && phone.trim() !== '') recycler.phone = phone.trim();
    if (address !== undefined && address.trim() !== '') recycler.address = address.trim();
    if (city !== undefined && city.trim() !== '') recycler.city = city.trim();
    if (locality !== undefined && locality.trim() !== '') recycler.locality = locality.trim();
    if (bio !== undefined && bio.trim() !== '') recycler.bio = bio.trim();

    // Update location if provided (with proper validation)
    if (latitude !== undefined && latitude !== '' && latitude !== 'NaN' && 
        longitude !== undefined && longitude !== '' && longitude !== 'NaN') {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      console.log('📍 Processing location:', { latitude, longitude, lat, lng });
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        // Store as simple fields
        recycler.latitude = lat;
        recycler.longitude = lng;
        
        // Also store in nested location object
        recycler.location = {
          latitude: lat,
          longitude: lng
        };
        
        console.log('✅ Location saved:', recycler.location);
      } else {
        console.log('❌ Invalid coordinates - out of range or NaN');
        return next(new AppError('Invalid location coordinates', 400));
      }
    }

    // ✅ CHECK IF PROFILE IS NOW COMPLETE
    const isProfileComplete = recycler.city && recycler.locality && recycler.address;
    
    console.log('🔍 Profile completion check:', {
      city: !!recycler.city,
      locality: !!recycler.locality,
      address: !!recycler.address,
      isComplete: isProfileComplete
    });

    if (isProfileComplete) {
      recycler.profileCompleted = true;
      
      // ✅ SUBMIT FOR ADMIN VERIFICATION (like NGO flow)
      if (!recycler.verificationRequestedAt) {
        recycler.verificationRequestedAt = new Date();
        recycler.isVerified = false;
        recycler.verificationStatus = 'PENDING';
        
        console.log('📬 [Recycler Verification] Profile completed - submitting for admin verification:', {
          recyclerId: recycler._id,
          recyclerName: recycler.name,
          city: recycler.city,
          locality: recycler.locality,
          requestedAt: recycler.verificationRequestedAt
        });
      }
    } else {
      console.log('📋 Profile incomplete. Missing:', {
        city: !recycler.city,
        locality: !recycler.locality,
        address: !recycler.address
      });
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
        console.log('📤 Profile image uploaded');
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        return next(new AppError('Failed to upload image', 500));
      }
    }

    await recycler.save();

    console.log('✅ [Recycler Profile Update] Profile saved:', {
      email: recycler.email,
      profileCompleted: recycler.profileCompleted,
      verificationStatus: recycler.verificationStatus
    });

    // ✅ Return appropriate message
    const message = recycler.profileCompleted && recycler.verificationStatus === 'PENDING'
      ? '✅ Profile completed! Your recycler profile has been submitted for verification. An admin from your city will review and approve your profile within 24-48 hours. You will receive an email once verified.'
      : 'Profile updated successfully';

    res.status(200).json({
      success: true,
      message,
      user: recycler.getPublicProfile(),
      needsVerification: recycler.profileCompleted && recycler.verificationStatus === 'PENDING'
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    next(error);
  }
};

/**
 * Change password
 * @route PUT /api/recycler/auth/change-password
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

    console.log('✅ Password changed for recycler:', recycler.email);

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
 * Logout recycler
 * @route POST /api/recycler/auth/logout
 */
exports.logout = async (req, res, next) => {
  try {
    console.log('✅ Recycler logout:', req.user.email || 'Unknown');

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    next(error);
  }
};