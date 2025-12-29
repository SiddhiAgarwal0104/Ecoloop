const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/appError');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ================= REGISTER =================
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password)
      return next(new AppError('All fields required', 400));

    const exists = await User.findOne({ email });
    if (exists) return next(new AppError('Email already exists', 400));

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'HOUSEHOLD',
      locality: 'Not Set',
      address: 'Not Set',
      authProvider: 'local',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: { user, token },
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

    const token = generateToken(user._id);

    res.json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
};

// ================= GOOGLE AUTH =================
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        profilePicture: picture,
        role: 'HOUSEHOLD',
        locality: 'Not Set',
        address: 'Not Set',
        authProvider: 'google',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user,
        token,
        needsProfileCompletion: user.locality === 'Not Set',
      },
    });
  } catch (err) {
    next(new AppError('Google auth failed', 401));
  }
};

// ================= GET ME =================
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: { user } });
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res, next) => {
  try {
    const { phone, locality, address } = req.body;

    const user = await User.findById(req.user.id);

    if (phone !== undefined) user.phone = phone;
    if (locality !== undefined) user.locality = locality;
    if (address !== undefined) user.address = address;

    await user.save();

    res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};
