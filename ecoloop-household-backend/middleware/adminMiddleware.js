const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const AppError = require('../utils/appError');

/**
 * Verify Admin JWT Token and check admin role
 */
exports.adminAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Please provide a valid token', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role !== 'ADMIN') {
      return next(new AppError('Access denied. Admin role required', 403));
    }

    const admin = await Admin.findOne({ userId: user._id });

    if (!admin || !admin.isActive) {
      return next(new AppError('Admin account is not active', 403));
    }

    req.user = user;
    req.admin = admin;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

/**
 * Check specific admin permission
 */
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return next(new AppError('Admin not found', 403));
    }

    if (!req.admin.permissions[permission]) {
      return next(new AppError(`Permission denied: ${permission}`, 403));
    }

    next();
  };
};

/**
 * Check Super Admin role
 */
exports.superAdminOnly = (req, res, next) => {
  if (!req.admin) {
    return next(new AppError('Admin not found', 403));
  }

  if (req.admin.role !== 'SUPER_ADMIN') {
    return next(new AppError('Super Admin access required', 403));
  }

  next();
};
