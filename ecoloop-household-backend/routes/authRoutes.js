// const express = require('express');
// const router = express.Router();
// const {
//   register,
//   login,
//   googleAuth,
//   getMe,
//   updateProfile,
// } = require('../controllers/authController');
// const { protect } = require('../middleware/authMiddleware');

// // Public
// router.post('/register', register);
// router.post('/login', login);
// router.post('/google', googleAuth);

// // Protected
// router.get('/me', protect, getMe);
// router.put('/profile', protect, updateProfile);

// module.exports = router;

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ============ PUBLIC ROUTES ============
// Register (accepts role: HOUSEHOLD/NGO/RECYCLER)
router.post('/register', register);

// Login (works for all roles)
router.post('/login', login);

// Google Auth (accepts role parameter)
router.post('/google', googleAuth);

// ============ PROTECTED ROUTES ============
// Get current user profile (all roles)
router.get('/me', protect, getMe);

// Update profile (all roles)
router.put('/profile', protect, updateProfile);

module.exports = router;