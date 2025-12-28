const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Assumes JWT token is passed in Authorization header as "Bearer <token>"
 * Extracts userId and locality from token and attaches to req.user
 */
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to request
      req.user = {
        id: decoded.id,
        locality: decoded.locality, // Assumes locality is in JWT payload
        pincode: decoded.pincode,   // Assumes pincode is in JWT payload
      };

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };