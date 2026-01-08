const User = require('../models/User');
const Recycler = require('../models/Recycler');
const { generateToken } = require('../utils/generateToken');
const AppError = require('../utils/appError');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * UNIFIED AUTH CONTROLLER - FINAL VERSION
 * Handles authentication for all three roles: household, ngo, recycler
 * Supports both local and Google authentication
 */

// ================= REGISTER (SIGNUP) =================
/**
 * Register a new user with any role
 * @route POST /api/auth/register OR /api/auth/signup
 * @param {string} email - User email
 * @param {string} password - User password (min 6 chars)
 * @param {string} passwordConfirm - Confirm password (optional)
 * @param {string} name - User full name
 * @param {string} phone - User phone number
 * @param {string} role - User role: 'household', 'ngo', 'recycler'
 * @returns {Object} Token and user data
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, passwordConfirm, name, phone, role } = req.body;

    console.log('📥 Unified registration attempt:', { email, role });

    // ====== VALIDATION ======
    if (!name || !email || !password) {
      return next(new AppError('Name, email and password are required', 400));
    }

    if (!role) {
      return next(new AppError('Role is required (household, ngo, or recycler)', 400));
    }

    // Normalize and validate role
    const normalizedRole = role.toUpperCase();
    const validRoles = ['HOUSEHOLD', 'NGO', 'RECYCLER'];
    if (!validRoles.includes(normalizedRole)) {
      return next(new AppError('Invalid role. Must be: household, ngo, or recycler', 400));
    }

    // Validate password confirmation if provided
    if (passwordConfirm && password !== passwordConfirm) {
      return next(new AppError('Passwords do not match', 400));
    }

    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    // ====== ROLE-SPECIFIC REGISTRATION ======
    if (normalizedRole === 'RECYCLER') {
      // RECYCLER - Use Recycler model
      console.log('🚴 Processing recycler registration');

      const existingRecycler = await Recycler.findOne({ email: email.toLowerCase() });
      if (existingRecycler) {
        return next(new AppError('Email already registered', 409));
      }

      const recycler = new Recycler({
        email: email.toLowerCase(),
        password,
        name: name || null,
        phone: phone || null
      });

      await recycler.save();
      const token = generateToken(recycler._id, 'RECYCLER');

      console.log('✅ Recycler registered:', { id: recycler._id, email: recycler.email });

      return res.status(201).json({
        success: true,
        message: 'Recycler registration successful',
        token,
        data: {
          user: {
            ...recycler.getPublicProfile(),
            role: 'RECYCLER',  // Explicitly set role
            profileCompleted: true  // Recyclers don't need profile completion
          },
          needsProfileCompletion: false  // Recyclers go straight to dashboard
        }
      });

    } else {
      // HOUSEHOLD or NGO - Use User model
      console.log(`🏠/🏢 Processing ${normalizedRole} registration`);

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return next(new AppError('Email already registered', 409));
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phone: phone || null,
        role: normalizedRole,
        locality: 'Not Set',
        address: 'Not Set',
        authProvider: 'local',
        profileCompleted: normalizedRole === 'HOUSEHOLD' ? true : false, // Household doesn't need profile completion, NGO does
        isVerified: normalizedRole === 'HOUSEHOLD' ? true : false, // Household is auto-verified
        verificationRequestedAt: null
      });

      const token = generateToken(user._id, normalizedRole);

      console.log('✅ User registered:', {
        id: user._id,
        role: user.role,
        email: user.email,
        needsProfileCompletion: normalizedRole !== 'HOUSEHOLD'
      });

      return res.status(201).json({
        success: true,
        message: `${normalizedRole === 'HOUSEHOLD' ? 'Household' : 'NGO'} registration successful!`,
        token,
        data: {
          user: {
            ...user.toObject(),
            profileCompleted: normalizedRole === 'HOUSEHOLD' ? true : false
          },
          needsProfileCompletion: normalizedRole !== 'HOUSEHOLD'
        }
      });
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    next(error);
  }
};

// Alias for backward compatibility
exports.signup = exports.register;

// ================= LOGIN =================
/**
 * Login user with any role
 * @route POST /api/auth/login
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role (optional but recommended): 'household', 'ngo', 'recycler'
 * @returns {Object} Token and user data
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // ====== VALIDATION ======
    if (!email || !password) {
      return next(new AppError('Email and password are required', 400));
    }

    console.log('📥 Unified login attempt:', { email, role: role || 'auto-detect' });

    const normalizedRole = role ? role.toUpperCase() : null;

    // ====== ROLE-SPECIFIC LOGIN ======
    if (normalizedRole === 'RECYCLER') {
      // RECYCLER LOGIN
      console.log('🚴 Processing recycler login');

      const recycler = await Recycler.findOne({ email: email.toLowerCase() }).select('+password');

      if (!recycler || !(await recycler.comparePassword(password))) {
        return next(new AppError('Invalid email or password', 401));
      }

      const token = generateToken(recycler._id, 'RECYCLER');

      return res.status(200).json({
        success: true,
        message: 'Recycler login successful',
        token,
        data: {
          user: {
            ...recycler.getPublicProfile(),
            role: 'RECYCLER',  // Explicitly set role
            profileCompleted: recycler.profileCompleted || true  // Recyclers are auto-completed
          }
        }
      });

    } else {
      // HOUSEHOLD or NGO LOGIN
      console.log('🏠/🏢 Processing household/ngo login');

      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user) {
        return next(new AppError('Invalid credentials', 401));
      }

      if (user.authProvider === 'google') {
        return next(new AppError('Use Google Sign-In', 401));
      }

      const passwordValid = await user.comparePassword(password);
      if (!passwordValid) {
        return next(new AppError('Invalid credentials', 401));
      }

      // Check if NGO is verified
      if (user.role === 'NGO' && !user.isVerified) {
        return next(new AppError('Your NGO is pending admin verification. You will receive an email once approved.', 403));
      }

      const token = generateToken(user._id, user.role);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        data: {
          user: {
            ...user.toObject(),
            profileCompleted: user.profileCompleted || false
          }
        }
      });
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    next(error);
  }
};

// ================= GOOGLE AUTH =================
/**
 * Google OAuth authentication
 * @route POST /api/auth/google
 * @param {string} credential - Google ID token
 * @param {string} role - User role for new users: 'household', 'ngo'
 * @returns {Object} Token and user data
 */
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return next(new AppError('Google credential is required', 400));
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub } = ticket.getPayload();

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // New user registration via Google
      isNewUser = true;
      const validRoles = ['HOUSEHOLD', 'NGO'];
      const userRole = role && validRoles.includes(role.toUpperCase()) 
        ? role.toUpperCase() 
        : 'HOUSEHOLD';

      user = await User.create({
        name,
        email,
        googleId: sub,
        profilePicture: picture,
        role: userRole,
        locality: 'Not Set',
        address: 'Not Set',
        authProvider: 'google',
        profileCompleted: false,
        isVerified: false,
        verificationRequestedAt: null
      });
      
      console.log('✅ [Google Auth] New user created:', {
        id: user._id,
        role: user.role,
        email: user.email,
        needsProfileCompletion: true
      });
    }

    // Check if profile is completed
    if (!user.profileCompleted) {
      console.log('🔄 [Google Auth] Profile not completed');
      const token = generateToken(user._id, user.role);
      return res.json({
        success: true,
        message: 'Please complete your profile.',
        token,
        data: {
          user: {
            ...user.toObject(),
            isProfileComplete: false
          },
          needsProfileCompletion: true
        }
      });
    }

    // Check if NGO is verified (after profile completion)
    if (user.role === 'NGO' && !user.isVerified) {
      console.log('⏳ [Google Auth] NGO pending verification');
      return res.json({
        success: false,
        message: 'Your NGO is pending admin verification. You will receive an email once approved.',
        data: {
          user: {
            ...user.toObject(),
            isProfileComplete: user.profileCompleted
          },
          isNGOPendingVerification: true
        }
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: isNewUser && user.role === 'NGO' 
        ? 'Registration successful! Your NGO is pending admin verification.' 
        : 'Login successful!',
      data: {
        user: {
          ...user.toObject(),
          isProfileComplete: user.isProfileComplete
        },
        token,
        needsProfileCompletion: !user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error('❌ Google auth error:', error);
    next(new AppError('Google authentication failed', 401));
  }
};

// ================= GET PROFILE (ME) =================
/**
 * Get current user profile
 * @route GET /api/auth/profile OR /api/auth/me
 * @access Private - requires valid JWT token
 * @returns {Object} User profile data
 */
exports.getProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new AppError('User not authenticated', 401));
    }

    const { id, role } = req.user;

    if (role === 'RECYCLER') {
      const profile = await Recycler.findById(id);
      if (!profile) {
        return next(new AppError('Recycler profile not found', 404));
      }
      return res.status(200).json({
        success: true,
        data: profile.getPublicProfile()
      });
    } else {
      const profile = await User.findById(id);
      if (!profile) {
        return next(new AppError('User profile not found', 404));
      }
      return res.status(200).json({
        success: true,
        data: {
          user: {
            ...profile.toObject(),
            isProfileComplete: profile.isProfileComplete
          }
        }
      });
    }
  } catch (error) {
    console.error('❌ Get profile error:', error.message);
    next(error);
  }
};

// Alias for backward compatibility
exports.getMe = exports.getProfile;

// ================= UPDATE PROFILE =================
/**
 * Update user profile (Household/NGO only)
 * @route PUT /api/auth/profile
 * @access Private
 * @param {string} phone - Phone number
 * @param {string} city - City name
 * @param {string} locality - Locality/area
 * @param {string} pincode - Pincode
 * @param {string} address - Full address
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Object} Updated user data
 */
exports.updateProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new AppError('User not authenticated', 401));
    }

    const { phone, city, locality, pincode, address, latitude, longitude } = req.body;

    console.log('📝 Update profile request:', { phone, city, locality, pincode, address, latitude, longitude });

    // Recyclers cannot update profile via this endpoint
    if (req.user.role === 'RECYCLER') {
      return next(new AppError('Recyclers should use recycler-specific profile endpoint', 400));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update basic fields
    if (phone !== undefined && phone.trim()) user.phone = phone.trim();
    if (city !== undefined && city.trim()) user.city = city.trim();
    if (locality !== undefined && locality.trim()) user.locality = locality.trim();
    if (pincode !== undefined && pincode.trim()) user.pincode = pincode.trim();
    if (address !== undefined && address.trim()) user.address = address.trim();
    
    // Update location coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      user.location = {
        latitude: lat,
        longitude: lng
      };
    }

    console.log('✏️ Updated user fields:', { city: user.city, locality: user.locality, pincode: user.pincode });

    // Check if profile is now complete
    if (user.role === 'NGO') {
      user.profileCompleted =
        user.city?.trim() &&
        user.locality?.trim() &&
        user.address?.trim() &&
        user.location &&
        typeof user.location.latitude === 'number' &&
        typeof user.location.longitude === 'number';
      
      // If NGO profile is completed, mark for verification
      if (user.profileCompleted && !user.verificationRequestedAt) {
        user.isVerified = false;
        user.verificationRequestedAt = new Date();
        console.log('📬 [Profile] NGO profile completed - marking for admin verification:', {
          ngoId: user._id,
          ngoName: user.name,
          city: user.city,
          requestedAt: user.verificationRequestedAt
        });
      }
    } else {
      // HOUSEHOLD needs city, locality, pincode, and address
      user.profileCompleted = 
        user.city && user.city !== 'Not Set' &&
        user.locality && user.locality !== 'Not Set' &&
        user.pincode && user.pincode !== 'Not Set' &&
        user.address && user.address !== 'Not Set';
      
      // Household users are verified once profile is complete
      if (user.profileCompleted) {
        user.isVerified = true;
      }
    }

    await user.save();

    console.log('✅ Profile saved:', { 
      city: user.city, 
      locality: user.locality, 
      pincode: user.pincode,
      profileCompleted: user.profileCompleted,
      role: user.role,
      isVerified: user.isVerified
    });

    res.json({
      success: true,
      message: user.role === 'NGO' && user.profileCompleted
        ? '✅ Profile completed! Your NGO is now pending admin verification. An admin from your city will review and approve your NGO soon.'
        : 'Profile updated successfully',
      data: { 
        user: {
          ...user.toObject(),
          isProfileComplete: user.profileCompleted
        }
      },
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    next(error);
  }
};

// ================= LOGOUT =================
/**
 * Logout user (client-side mainly)
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logout = async (req, res, next) => {
  try {
    console.log('🚪 User logging out');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};