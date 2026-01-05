const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/appError');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ================= REGISTER (WITH ROLE) =================
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password)
      return next(new AppError('All fields required', 400));

    // Validate role
    const validRoles = ['HOUSEHOLD', 'NGO', 'RECYCLER'];
    const userRole = role && validRoles.includes(role.toUpperCase()) 
      ? role.toUpperCase() 
      : 'HOUSEHOLD';

    const exists = await User.findOne({ email });
    if (exists) return next(new AppError('Email already exists', 400));

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
      locality: 'Not Set',
      address: 'Not Set',
      authProvider: 'local',
      profileCompleted: false
    });

const token = generateToken(user._id, user.role, user.locality);

    res.status(201).json({
      success: true,
      data: { 
        user: {
          ...user.toObject(),
          isProfileComplete: user.isProfileComplete
        }, 
        token 
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================= LOGIN =================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return next(new AppError('Invalid credentials', 401));

    if (user.authProvider === 'google')
      return next(new AppError('Use Google Sign-In', 401));

    const ok = await user.comparePassword(password);
    if (!ok) return next(new AppError('Invalid credentials', 401));

    const token = generateToken(user._id, user.role, user.locality);

    res.json({ 
      success: true, 
      data: { 
        user: {
          ...user.toObject(),
          isProfileComplete: user.isProfileComplete
        }, 
        token 
      } 
    });
  } catch (err) {
    next(err);
  }
};

// ================= GOOGLE AUTH (WITH ROLE) =================
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential, role } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      // Validate role for new users
      const validRoles = ['HOUSEHOLD', 'NGO', 'RECYCLER'];
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
        profileCompleted: false
      });
    }

    const token = generateToken(user._id, user.role, user.locality);

    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          isProfileComplete: user.isProfileComplete
        },
        token,
        needsProfileCompletion: !user.isProfileComplete,
      },
    });
  } catch (err) {
    next(new AppError('Google auth failed', 401));
  }
};

// ================= GET ME =================
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ 
    success: true, 
    data: { 
      user: {
        ...user.toObject(),
        isProfileComplete: user.isProfileComplete
      }
    } 
  });
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res, next) => {
  try {
    const { phone, locality, address, latitude, longitude } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    // Update basic fields
    if (phone !== undefined) user.phone = phone;
    if (locality !== undefined && locality.trim()) user.locality = locality.trim();
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

    // Check if profile is now complete
    if (user.role === 'NGO') {
  user.profileCompleted =
    user.locality?.trim() &&
    user.address?.trim() &&
    user.location &&
    typeof user.location.latitude === 'number' &&
    typeof user.location.longitude === 'number';
}
else {
      // HOUSEHOLD needs at least locality and address
      user.profileCompleted = 
        user.locality && user.locality !== 'Not Set' &&
        user.address && user.address !== 'Not Set';
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { 
        user: {
          ...user.toObject(),
          isProfileComplete: user.isProfileComplete
        }
      },
    });
  } catch (err) {
    next(err);
  }
};