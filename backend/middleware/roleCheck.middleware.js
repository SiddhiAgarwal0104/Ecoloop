// middleware/roleCheck.middleware.js

// Simple role check middleware factory for clearer usage in routes
module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success:false, message: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success:false, message: `Role '${req.user.role}' not authorized` });
    }
    next();
  };
};