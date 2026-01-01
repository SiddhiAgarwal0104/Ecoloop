const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/recyclerAuthController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

/**
 * Authentication Routes for Recycler Module
 * All routes implement comprehensive error handling and validation
 */

// ====== Public Routes ======
/**
 * Register new recycler
 * @route POST /api/recycler/auth/register
 * @body {string} email - Email address
 * @body {string} password - Password (min 6 chars)
 * @body {string} confirmPassword - Confirm password
 * @body {string} name - Full name
 * @body {string} phone - Phone number
 */
router.post('/register', register);

/**
 * Login recycler
 * @route POST /api/recycler/auth/login
 * @body {string} email - Email address
 * @body {string} password - Password
 */
router.post('/login', login);

// ====== Protected Routes ======
// All routes below require valid JWT token

/**
 * Get current recycler profile
 * @route GET /api/recycler/auth/profile
 * @access Private
 */
router.get('/profile', protect, getProfile);

/**
 * Update recycler profile
 * @route PUT /api/recycler/auth/profile
 * @access Private
 * @body {string} name - Full name (optional)
 * @body {string} phone - Phone number (optional)
 * @body {string} address - Address (optional)
 * @body {number} latitude - Location latitude (optional)
 * @body {number} longitude - Location longitude (optional)
 * @body {string} bio - Bio (optional)
 * @file {File} profileImage - Profile image (optional)
 */
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

/**
 * Change password
 * @route PUT /api/recycler/auth/change-password
 * @access Private
 * @body {string} currentPassword - Current password
 * @body {string} newPassword - New password
 * @body {string} confirmPassword - Confirm new password
 */
router.put('/change-password', protect, changePassword);

/**
 * Logout recycler
 * @route POST /api/recycler/auth/logout
 * @access Private
 */
router.post('/logout', protect, logout);

module.exports = router;
