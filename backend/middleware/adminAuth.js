const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for admin login attempts
 * Prevents brute force attacks
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Rate limiter for general admin API routes
 * Prevents API abuse
 */
const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Validate admin permissions for data access
 * Ensures admin can only view, not modify user data
 */
const validateReadOnlyAccess = (req, res, next) => {
  const restrictedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const restrictedPaths = [
    '/api/admin/users',
    '/api/admin/waste-logs/modify',
    '/api/admin/localities/modify'
  ];

  // Check if route is attempting to modify user data
  const isRestrictedPath = restrictedPaths.some(path => req.path.startsWith(path));
  const isRestrictedMethod = restrictedMethods.includes(req.method);

  if (isRestrictedPath && isRestrictedMethod) {
    return res.status(403).json({
      success: false,
      message: 'Admins can only view data. Modification of user data is not allowed.'
    });
  }

  next();
};

/**
 * Log admin actions for audit trail
 * Records important admin activities
 */
const logAdminAction = (req, res, next) => {
  const admin = req.admin;
  const action = `${req.method} ${req.originalUrl}`;
  const timestamp = new Date().toISOString();

  // Log to console (in production, use a proper logging service)
  console.log(`[ADMIN ACTION] ${timestamp} | Admin: ${admin?.email || 'Unknown'} | Action: ${action}`);

  // In production, you would save this to a dedicated AdminLog model
  // Example: await AdminLog.create({ adminId: admin._id, action, timestamp, ip: req.ip });

  next();
};

/**
 * Validate date range parameters
 * Ensures valid date ranges for analytics queries
 */
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use ISO date format (YYYY-MM-DD).'
      });
    }

    // Check if start date is before end date
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date.'
      });
    }

    // Check if date range is not too large (max 1 year)
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    if (end - start > oneYear) {
      return res.status(400).json({
        success: false,
        message: 'Date range cannot exceed 1 year.'
      });
    }
  }

  next();
};

module.exports = {
  loginRateLimiter,
  apiRateLimiter,
  validateReadOnlyAccess,
  logAdminAction,
  validateDateRange
};