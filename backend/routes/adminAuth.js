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
  deactivateAdmin,
  googleLogin
} = require('../controllers/adminAuthController');

const { protect, authorize } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/adminAuth');

// Public routes
router.post('/login', loginRateLimiter, loginAdmin);
router.post('/register', registerAdmin);
router.post('/google', googleLogin);

// Protected routes (requires authentication)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logoutAdmin);

module.exports = router;