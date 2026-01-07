const jwt = require('jsonwebtoken');

/**
 * JWT Token Generation Module
 * Creates and manages JWT tokens for authentication
 */

/**
 * Generate JWT token for recycler
 * @param {string} id - Recycler MongoDB ObjectId
 * @param {string} role - User role (default: 'RECYCLER')
 * @param {number} expiresIn - Token expiration time (default: 7d)
 * @returns {string} JWT token
 * @throws {Error} If JWT_SECRET is not defined
 * @example
 * const token = generateToken('507f1f77bcf86cd799439011', 'RECYCLER');
 */
const generateToken = (id, role = 'RECYCLER', expiresIn = null) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  const options = {
    expiresIn: expiresIn || process.env.JWT_EXPIRE || '7d'
  };

  try {
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, options);
    return token;
  } catch (error) {
    console.error('❌ Token generation error:', error.message);
    throw error;
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 * @example
 * const decoded = verifyToken(token);
 */
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    throw error;
  }
};

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token to decode
 * @returns {object} Decoded token payload
 * @example
 * const payload = decodeToken(token);
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
