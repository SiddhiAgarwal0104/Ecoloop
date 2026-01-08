const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getProfile,
  updateProfile,
  logout
} = require('../controllers/unifiedAuthController');
const { requireAuth } = require('../middleware/roleBasedAuth');

/**
 * UNIFIED AUTH ROUTES
 * Central authentication endpoint for all three roles: household, ngo, recycler
 * 
 * Key Features:
 * - Single signup/login endpoint for all roles
 * - Role-based token generation
 * - Role field in JWT payload
 * - Role-based access control via middleware
 */

/**
 * Register/Signup new user
 * @route POST /api/auth/signup
 * @access Public
 * @param {Object} req.body
 * @param {string} req.body.email - User email (required)
 * @param {string} req.body.password - Password min 6 chars (required)
 * @param {string} req.body.passwordConfirm - Confirm password (required)
 * @param {string} req.body.name - User full name
 * @param {string} req.body.phone - User phone number
 * @param {string} req.body.role - User role: 'household', 'ngo', or 'recycler' (required)
 * @returns {Object} {success, token, user, message}
 * @example
 * POST /api/auth/signup
 * {
 *   "email": "recycler@example.com",
 *   "password": "password123",
 *   "passwordConfirm": "password123",
 *   "name": "John Recycler",
 *   "phone": "9876543210",
 *   "role": "recycler"
 * }
 */
router.post('/signup', signup);

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 * @param {Object} req.body
 * @param {string} req.body.email - User email (required)
 * @param {string} req.body.password - User password (required)
 * @param {string} req.body.role - User role: 'household', 'ngo', or 'recycler' (optional, for optimization)
 * @returns {Object} {success, token, user, message}
 * @example
 * POST /api/auth/login
 * {
 *   "email": "recycler@example.com",
 *   "password": "password123",
 *   "role": "recycler"
 * }
 */
router.post('/login', login);

/**
 * Get current user profile
 * @route GET /api/auth/profile
 * @access Private - requires valid JWT token
 * @returns {Object} {success, data: userProfile}
 */
router.get('/profile', requireAuth, getProfile);

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private - requires valid JWT token
 * @param {Object} req.body
 * @param {string} req.body.phone - Phone number
 * @param {string} req.body.city - City name
 * @param {string} req.body.locality - Locality/Area
 * @param {string} req.body.pincode - Pincode (required for Household)
 * @param {string} req.body.address - Full address
 * @param {number} req.body.latitude - Location latitude (required for NGO)
 * @param {number} req.body.longitude - Location longitude (required for NGO)
 * @returns {Object} {success, message, data: {user}}
 */
router.put('/profile', requireAuth, updateProfile);

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private - requires valid JWT token
 * @returns {Object} {success, message}
 */
router.post('/logout', requireAuth, logout);

module.exports = router;
