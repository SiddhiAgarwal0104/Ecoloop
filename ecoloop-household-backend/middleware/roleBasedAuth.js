const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Recycler = require('../models/Recycler');
const AppError = require('../utils/appError');

/**
 * UNIFIED ROLE-BASED MIDDLEWARE
 * Handles authentication and authorization for all three roles
 */

/**
 * Protect route - Verify JWT token and attach user + role to request
 * Supports all three roles: HOUSEHOLD, NGO, RECYCLER
 * @middleware
 * @example
 * router.get('/protected', requireAuth, controllerFunction);
 */
exports.requireAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, return error
    if (!token) {
      return next(new AppError('No authorization token provided', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log(`✅ Token verified for user: ${decoded.id}, role: ${decoded.role}`);

      // Attach user info to request
      req.user = {
        id: decoded.id,
        role: decoded.role || 'HOUSEHOLD' // Default to HOUSEHOLD if role not in token
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Token has expired', 401));
      }

      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token', 401));
      }

      return next(new AppError('Authentication failed', 401));
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return next(new AppError('Authentication error', 500));
  }
};

/**
 * Require specific role(s)
 * @param {string|string[]} roles - Required role(s): 'HOUSEHOLD', 'NGO', 'RECYCLER', 'ADMIN'
 * @returns {function} Middleware function
 * @example
 * router.get('/admin-only', requireAuth, requireRole('ADMIN'), controllerFunction);
 * router.get('/ngo-or-admin', requireAuth, requireRole(['NGO', 'ADMIN']), controllerFunction);
 */
exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    // Normalize roles to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    console.log(`✅ Role check passed: ${req.user.role}`);
    next();
  };
};

/**
 * RECYCLER SPECIFIC AUTHENTICATION
 * Enhanced middleware for recycler routes
 * Loads full recycler profile if needed
 */
exports.recyclerAuth = async (req, res, next) => {
  try {
    // First run standard auth
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('No authorization token provided', 401));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if recycler
      if (decoded.role !== 'RECYCLER') {
        return next(new AppError('Recycler access required', 403));
      }

      // Load full recycler profile
      const recycler = await Recycler.findById(decoded.id);

      if (!recycler) {
        return next(new AppError('Recycler profile not found', 404));
      }

      req.user = {
        id: decoded.id,
        role: 'RECYCLER'
      };

      req.recycler = recycler;

      console.log(`✅ Recycler authenticated: ${recycler.email}`);
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Token has expired', 401));
      }

      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token', 401));
      }

      return next(new AppError('Authentication failed', 401));
    }
  } catch (error) {
    console.error('❌ Recycler auth error:', error);
    return next(new AppError('Authentication error', 500));
  }
};

/**
 * NGO SPECIFIC AUTHENTICATION
 * Enhanced middleware for NGO routes
 * Ensures NGO is verified
 */
exports.ngoAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('No authorization token provided', 401));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if NGO
      if (decoded.role !== 'NGO') {
        return next(new AppError('NGO access required', 403));
      }

      // Load full user profile
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new AppError('NGO profile not found', 404));
      }

      // Check if verified
      if (!user.isVerified) {
        return next(
          new AppError(
            'Your NGO is pending admin verification. You will receive an email once approved.',
            403
          )
        );
      }

      req.user = {
        id: decoded.id,
        role: 'NGO'
      };

      req.ngo = user;

      console.log(`✅ NGO authenticated: ${user.email}`);
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Token has expired', 401));
      }

      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token', 401));
      }

      return next(new AppError('Authentication failed', 401));
    }
  } catch (error) {
    console.error('❌ NGO auth error:', error);
    return next(new AppError('Authentication error', 500));
  }
};

/**
 * HOUSEHOLD SPECIFIC AUTHENTICATION
 * Enhanced middleware for household routes
 */
exports.householdAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('No authorization token provided', 401));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if household
      if (decoded.role !== 'HOUSEHOLD') {
        return next(new AppError('Household access required', 403));
      }

      // Load full user profile
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new AppError('Household profile not found', 404));
      }

      req.user = {
        id: decoded.id,
        role: 'HOUSEHOLD'
      };

      req.household = user;

      console.log(`✅ Household authenticated: ${user.email}`);
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Token has expired', 401));
      }

      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token', 401));
      }

      return next(new AppError('Authentication failed', 401));
    }
  } catch (error) {
    console.error('❌ Household auth error:', error);
    return next(new AppError('Authentication error', 500));
  }
};

/**
 * ADMIN SPECIFIC AUTHENTICATION
 * Existing admin auth - kept for backward compatibility
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

    const Admin = require('../models/Admin');
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
