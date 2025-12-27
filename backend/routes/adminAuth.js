const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getMe,
  updateProfile,
  changePassword,
  logoutAdmin,
  getAllAdmins,
  deactivateAdmin
} = require('../controllers/adminAuthController');

const { protect, authorize } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/adminAuth');

// Public routes
router.post('/login', loginRateLimiter, loginAdmin);

// Protected routes (requires authentication)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logoutAdmin);

// Super Admin only routes
router.post('/register', protect, authorize('super_admin'), registerAdmin);
router.get('/admins', protect, authorize('super_admin'), getAllAdmins);
router.put('/deactivate/:id', protect, authorize('super_admin'), deactivateAdmin);

module.exports = router;