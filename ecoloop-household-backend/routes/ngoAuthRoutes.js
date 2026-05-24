const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/ngoAuthController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Authentication Routes for NGO Module
 * All routes implement comprehensive error handling and validation
 */

// ====== Protected Routes ======
// All routes below require valid JWT token

/**
 * Get current NGO profile
 * @route GET /api/ngo/auth/profile
 * @access Private
 */
router.get('/profile', protect, getProfile);

/**
 * Update NGO profile (including profile completion and verification request)
 * @route PUT /api/ngo/auth/profile
 * @access Private
 * @body {string} phone - Phone number (optional)
 * @body {string} city - City (required)
 * @body {string} locality - Locality (required)
 * @body {string} address - Address (required)
 * @body {number} latitude - Location latitude (optional)
 * @body {number} longitude - Location longitude (optional)
 */
router.put('/profile', protect, updateProfile);

/**
 * Change password
 * @route PUT /api/ngo/auth/change-password
 * @access Private
 * @body {string} currentPassword - Current password
 * @body {string} newPassword - New password
 * @body {string} confirmPassword - Confirm new password
 */
router.put('/change-password', protect, changePassword);

/**
 * Logout NGO
 * @route POST /api/ngo/auth/logout
 * @access Private
 */
router.post('/logout', protect, logout);

module.exports = router;
