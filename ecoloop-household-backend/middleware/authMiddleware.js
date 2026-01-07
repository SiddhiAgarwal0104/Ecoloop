const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

/**
 * Authentication Middleware
 * Verifies JWT token and protects routes requiring authentication
 */

/**
 * Protect route - Verify JWT token and attach user to request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @middleware
 * @example
 * router.get('/protected', protect, controllerFunction);
 */
exports.protect = async (req, res, next) => {
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

      // Attach user ID to request
      req.user = { id: decoded.id };

      console.log(`✅ User authenticated: ${decoded.id}`);
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
 * Restrict route to specific roles
 * @param {string} roles - Allowed roles (currently not fully implemented)
 * @returns {function} Middleware function
 * @middleware
 * @example
 * router.delete('/:id', protect, restrictTo('ADMIN'), deleteController);
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Role checking can be extended based on role info in JWT payload
    // For now, this is a placeholder for future role-based access control
    if (roles && roles.length > 0) {
      console.log(`🔐 Route restricted to roles: ${roles.join(', ')}`);
    }
    next();
  };
};
