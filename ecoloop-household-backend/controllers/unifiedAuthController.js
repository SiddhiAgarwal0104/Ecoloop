const User = require('../models/User');
const Recycler = require('../models/Recycler');
const { generateToken } = require('../utils/generateToken');
const AppError = require('../utils/appError');
const { OAuth2Client } = require('google-auth-library');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── In-memory OTP store (replace with Redis in production) ───────────────────
// Structure: { email: { otp, expiresAt, purpose } }
const otpStore = new Map();

const storeOTP = (email, otp, purpose = 'verify') => {
  otpStore.set(email.toLowerCase(), {
    otp,
    purpose,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
};

const verifyStoredOTP = (email, otp) => {
  const record = otpStore.get(email.toLowerCase());
  if (!record) return { valid: false, reason: 'No OTP found. Please request a new one.' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, reason: 'OTP has expired. Please request a new one.' };
  }
  if (record.otp !== otp) return { valid: false, reason: 'Incorrect OTP.' };
  otpStore.delete(email.toLowerCase());
  return { valid: true, purpose: record.purpose };
};

// ─── Helper: build user payload from pending registration ─────────────────────
// We temporarily store pending registrations until email is verified
const pendingRegistrations = new Map();

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: SEND OTP (called before actual registration)
// POST /api/auth/send-otp
// Body: { email, purpose: 'verify' | 'reset' }
// ─────────────────────────────────────────────────────────────────────────────
exports.sendOTP = async (req, res, next) => {
  try {
    const { email, purpose = 'verify' } = req.body;

    if (!email) return next(new AppError('Email is required', 400));

    const normalizedEmail = email.toLowerCase();

    if (purpose === 'verify') {
      // Check if email already registered and verified
      const existingUser = await User.findOne({ email: normalizedEmail });
      const existingRecycler = await Recycler.findOne({ email: normalizedEmail });
      if (existingUser || existingRecycler) {
        return next(new AppError('Email already registered. Please login instead.', 409));
      }
    }

    if (purpose === 'reset') {
      // For password reset, email must exist
      const user = await User.findOne({ email: normalizedEmail });
      const recycler = await Recycler.findOne({ email: normalizedEmail });
      if (!user && !recycler) {
        return next(new AppError('No account found with this email.', 404));
      }
      const account = user || recycler;
      if (account.authProvider === 'google') {
        return next(new AppError('This account uses Google Sign-In. Password reset is not available.', 400));
      }
    }

    const otp = generateOTP();
    storeOTP(normalizedEmail, otp, purpose);
    await sendOTPEmail(normalizedEmail, otp, purpose);

    console.log(`✅ [OTP] Sent ${purpose} OTP to ${normalizedEmail}`);

    res.json({
      success: true,
      message: `OTP sent to ${email}. Check your inbox.`,
    });
  } catch (err) {
    console.error('❌ [OTP] Send error:', err);
    next(new AppError('Failed to send OTP. Check email configuration.', 500));
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: VERIFY OTP (for email verification during signup)
// POST /api/auth/verify-otp
// Body: { email, otp }
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return next(new AppError('Email and OTP are required', 400));

    const result = verifyStoredOTP(email, otp);
    if (!result.valid) return next(new AppError(result.reason, 400));

    res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER (SIGNUP) — requires OTP verified first
// POST /api/auth/signup
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { email, password, passwordConfirm, name, phone, role, otpVerified } = req.body;

    console.log('📥 Registration attempt:', { email, role });

    // Validation
    if (!name || !email || !password) {
      return next(new AppError('Name, email and password are required', 400));
    }
    if (!role) {
      return next(new AppError('Role is required (household, ngo, or recycler)', 400));
    }
    if (!otpVerified) {
      return next(new AppError('Email verification is required. Please verify your email first.', 400));
    }

    const normalizedRole = role.toUpperCase();
    const validRoles = ['HOUSEHOLD', 'NGO', 'RECYCLER'];
    if (!validRoles.includes(normalizedRole)) {
      return next(new AppError('Invalid role. Must be: household, ngo, or recycler', 400));
    }

    if (passwordConfirm && password !== passwordConfirm) {
      return next(new AppError('Passwords do not match', 400));
    }
    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    if (normalizedRole === 'RECYCLER') {
      const existingRecycler = await Recycler.findOne({ email: email.toLowerCase() });
      if (existingRecycler) return next(new AppError('Email already registered', 409));

      const recycler = new Recycler({
        email: email.toLowerCase(),
        password,
        name: name || null,
        phone: phone || null,
        isEmailVerified: true,
      });

      await recycler.save();
      const token = generateToken(recycler._id, 'RECYCLER');

      return res.status(201).json({
        success: true,
        message: 'Recycler registration successful',
        token,
        data: {
          user: { ...recycler.getPublicProfile(), role: 'RECYCLER', profileCompleted: false },
          needsProfileCompletion: true,
        },
      });
    } else {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) return next(new AppError('Email already registered', 409));

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phone: phone || null,
        role: normalizedRole,
        locality: 'Not Set',
        address: 'Not Set',
        authProvider: 'local',
        isEmailVerified: true,
        profileCompleted: normalizedRole === 'HOUSEHOLD' ? true : false,
        isVerified: normalizedRole === 'HOUSEHOLD' ? true : false,
        verificationRequestedAt: null,
      });

      const token = generateToken(user._id, normalizedRole);

      return res.status(201).json({
        success: true,
        message: `${normalizedRole === 'HOUSEHOLD' ? 'Household' : 'NGO'} registration successful!`,
        token,
        data: {
          user: { ...user.toObject(), profileCompleted: normalizedRole === 'HOUSEHOLD' ? true : false },
          needsProfileCompletion: normalizedRole !== 'HOUSEHOLD',
        },
      });
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    next(error);
  }
};

exports.signup = exports.register;

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password are required', 400));
    }

    const normalizedRole = role ? role.toUpperCase() : null;

    if (normalizedRole === 'RECYCLER') {
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
          user: { ...recycler.getPublicProfile(), role: 'RECYCLER', profileCompleted: recycler.profileCompleted || true },
        },
      });
    } else {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user) return next(new AppError('Invalid credentials', 401));
      if (user.authProvider === 'google') return next(new AppError('Use Google Sign-In', 401));

      const passwordValid = await user.comparePassword(password);
      if (!passwordValid) return next(new AppError('Invalid credentials', 401));

      if (user.role === 'NGO' && !user.isVerified) {
        return next(new AppError('Your NGO is pending admin verification. You will receive an email once approved.', 403));
      }

      const token = generateToken(user._id, user.role);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        data: { user: { ...user.toObject(), profileCompleted: user.profileCompleted || false } },
      });
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD — Step 1: send reset OTP
// POST /api/auth/forgot-password
// Body: { email }
// ─────────────────────────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new AppError('Email is required', 400));

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    const recycler = await Recycler.findOne({ email: normalizedEmail });
    const account = user || recycler;

    if (!account) {
      // Security: don't reveal if email exists
      return res.json({ success: true, message: 'If an account exists, a reset OTP has been sent.' });
    }

    if (account.authProvider === 'google') {
      return next(new AppError('This account uses Google Sign-In. Password reset is not applicable.', 400));
    }

    const otp = generateOTP();
    storeOTP(normalizedEmail, otp, 'reset');
    await sendOTPEmail(normalizedEmail, otp, 'reset');

    console.log(`✅ [ForgotPW] Reset OTP sent to ${normalizedEmail}`);

    res.json({ success: true, message: 'If an account exists, a reset OTP has been sent.' });
  } catch (err) {
    console.error('❌ [ForgotPW] Error:', err);
    next(new AppError('Failed to process request', 500));
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD — Step 2: verify OTP + set new password
// POST /api/auth/reset-password
// Body: { email, otp, newPassword, confirmPassword }
// ─────────────────────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return next(new AppError('Email, OTP and new password are required', 400));
    }
    if (newPassword !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }
    if (newPassword.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    const result = verifyStoredOTP(email, otp);
    if (!result.valid) return next(new AppError(result.reason, 400));
    if (result.purpose !== 'reset') return next(new AppError('Invalid OTP purpose', 400));

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    const recycler = !user && await Recycler.findOne({ email: normalizedEmail }).select('+password');

    const account = user || recycler;
    if (!account) return next(new AppError('Account not found', 404));

    account.password = newPassword; // pre-save hook will hash it
    await account.save();

    console.log(`✅ [ResetPW] Password reset for ${normalizedEmail}`);

    res.json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    console.error('❌ [ResetPW] Error:', err);
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE AUTH
// POST /api/auth/google
// ─────────────────────────────────────────────────────────────────────────────
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential, role } = req.body;

    if (!credential) return next(new AppError('Google credential is required', 400));

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub } = ticket.getPayload();

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const validRoles = ['HOUSEHOLD', 'NGO'];
      const userRole = role && validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'HOUSEHOLD';

      user = await User.create({
        name,
        email,
        googleId: sub,
        profilePicture: picture,
        role: userRole,
        locality: 'Not Set',
        address: 'Not Set',
        authProvider: 'google',
        isEmailVerified: true, // Google emails are pre-verified
        profileCompleted: false,
        isVerified: false,
        verificationRequestedAt: null,
      });

      console.log('✅ [Google Auth] New user created:', { id: user._id, role: user.role, email: user.email });
    }

    if (!user.profileCompleted) {
      const token = generateToken(user._id, user.role);
      return res.json({
        success: true,
        message: 'Please complete your profile.',
        token,
        data: { user: { ...user.toObject(), isProfileComplete: false }, needsProfileCompletion: true },
      });
    }

    if (user.role === 'NGO' && !user.isVerified) {
      return res.json({
        success: false,
        message: 'Your NGO is pending admin verification.',
        data: { user: { ...user.toObject() }, isNGOPendingVerification: true },
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: isNewUser && user.role === 'NGO'
        ? 'Registration successful! Your NGO is pending admin verification.'
        : 'Login successful!',
      token,
      data: {
        user: { ...user.toObject(), isProfileComplete: user.profileCompleted },
        needsProfileCompletion: !user.profileCompleted,
      },
    });
  } catch (error) {
    console.error('❌ Google auth error:', error);
    next(new AppError('Google authentication failed', 401));
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET PROFILE (ME)
// ─────────────────────────────────────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) return next(new AppError('User not authenticated', 401));

    const { id, role } = req.user;

    if (role === 'RECYCLER') {
      const profile = await Recycler.findById(id);
      if (!profile) return next(new AppError('Recycler profile not found', 404));
      return res.status(200).json({ success: true, data: profile.getPublicProfile() });
    } else {
      const profile = await User.findById(id);
      if (!profile) return next(new AppError('User profile not found', 404));
      return res.status(200).json({
        success: true,
        data: { user: { ...profile.toObject(), isProfileComplete: profile.isProfileComplete } },
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getMe = exports.getProfile;

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) return next(new AppError('User not authenticated', 401));

    const { phone, city, locality, pincode, address, latitude, longitude } = req.body;

    if (req.user.role === 'RECYCLER') {
      return next(new AppError('Recyclers should use recycler-specific profile endpoint', 400));
    }

    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    if (phone !== undefined && phone.trim()) user.phone = phone.trim();
    if (city !== undefined && city.trim()) user.city = city.trim();
    if (locality !== undefined && locality.trim()) user.locality = locality.trim();
    if (pincode !== undefined && pincode.trim()) user.pincode = pincode.trim();
    if (address !== undefined && address.trim()) user.address = address.trim();

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      user.location = { latitude: lat, longitude: lng };
    }

    if (user.role === 'NGO') {
      user.profileCompleted =
        user.city?.trim() &&
        user.locality?.trim() &&
        user.address?.trim() &&
        user.location &&
        typeof user.location.latitude === 'number' &&
        typeof user.location.longitude === 'number';

      if (user.profileCompleted && !user.verificationRequestedAt) {
        user.isVerified = false;
        user.verificationRequestedAt = new Date();
      }
    } else {
      user.profileCompleted =
        user.city && user.city !== 'Not Set' &&
        user.locality && user.locality !== 'Not Set' &&
        user.pincode && user.pincode !== 'Not Set' &&
        user.address && user.address !== 'Not Set';

      if (user.profileCompleted) user.isVerified = true;
    }

    await user.save();

    res.json({
      success: true,
      message: user.role === 'NGO' && user.profileCompleted
        ? '✅ Profile completed! Your NGO is now pending admin verification.'
        : 'Profile updated successfully',
      data: { user: { ...user.toObject(), isProfileComplete: user.profileCompleted } },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};