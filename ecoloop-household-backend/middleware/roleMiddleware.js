const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

// ================= PROTECT MIDDLEWARE (AUTHENTICATE USER) =================
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new AppError('User no longer exists', 401));
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (err) {
      return next(new AppError('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

// ================= ROLE-BASED ACCESS CONTROL =================
// Usage: protect, restrictTo('HOUSEHOLD', 'NGO')
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. This route is only for ${roles.join(', ')} users.`,
          403
        )
      );
    }
    next();
  };
};

// ================= SPECIFIC ROLE MIDDLEWARES (SHORTHAND) =================

// Household only
exports.householdOnly = (req, res, next) => {
  if (req.user.role !== 'HOUSEHOLD') {
    return next(new AppError('Access denied. Household users only.', 403));
  }
  next();
};

// NGO only
exports.ngoOnly = (req, res, next) => {
  if (req.user.role !== 'NGO') {
    return next(new AppError('Access denied. NGO users only.', 403));
  }
  next();
};

// Recycler only
exports.recyclerOnly = (req, res, next) => {
  if (req.user.role !== 'RECYCLER') {
    return next(new AppError('Access denied. Recycler users only.', 403));
  }
  next();
};

// Household or NGO (for donation management)
exports.householdOrNgo = (req, res, next) => {
  if (!['HOUSEHOLD', 'NGO'].includes(req.user.role)) {
    return next(new AppError('Access denied. Household or NGO users only.', 403));
  }
  next();
};

// Household or Recycler (for recycle management)
exports.householdOrRecycler = (req, res, next) => {
  if (!['HOUSEHOLD', 'RECYCLER'].includes(req.user.role)) {
    return next(new AppError('Access denied. Household or Recycler users only.', 403));
  }
  next();
};

// ================= PROFILE COMPLETION CHECK =================
exports.requireCompleteProfile = (req, res, next) => {
  if (!req.user.profileCompleted) {
    return next(
      new AppError('Please complete your profile before accessing this feature', 403)
    );
  }
  next();
};

module.exports = exports;