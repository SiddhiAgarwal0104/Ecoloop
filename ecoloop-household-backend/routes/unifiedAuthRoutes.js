const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
  googleAuth,
  getProfile,
  updateProfile,
  logout,
} = require('../controllers/unifiedAuthController');
const { requireAuth } = require('../middleware/roleBasedAuth');

// ── Public Routes ─────────────────────────────────────────────────────────────

// Step 1 of signup: send OTP to email before account creation
// POST /api/auth/send-otp  { email, purpose: 'verify' | 'reset' }
router.post('/send-otp', sendOTP);

// Step 2 of signup: confirm the OTP is valid
// POST /api/auth/verify-otp  { email, otp }
router.post('/verify-otp', verifyOTP);

// Step 3 of signup: create the account (body must include otpVerified: true)
// POST /api/auth/signup  { email, password, passwordConfirm, name, phone, role, otpVerified }
router.post('/signup', signup);

// Login (unchanged behaviour)
// POST /api/auth/login  { email, password, role? }
router.post('/login', login);

// Google OAuth (unchanged behaviour, bug-fixed)
// POST /api/auth/google  { credential, role? }
router.post('/google', googleAuth);

// Forgot password — sends a reset OTP to the email
// POST /api/auth/forgot-password  { email }
router.post('/forgot-password', forgotPassword);

// Reset password — verifies OTP then updates password
// POST /api/auth/reset-password  { email, otp, newPassword, confirmPassword }
router.post('/reset-password', resetPassword);

// ── Protected Routes ──────────────────────────────────────────────────────────

router.get('/profile', requireAuth, getProfile);
router.get('/me', requireAuth, getProfile);       // alias kept for compatibility

router.put('/profile', requireAuth, updateProfile);

router.post('/logout', requireAuth, logout);

module.exports = router;