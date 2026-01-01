const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllBadges,
  getMyBadges,
  getBadgeById
} = require('../controllers/badgeController');

// All routes require authentication
router.use(protect);

// @route   GET /api/badges
router.get('/', getAllBadges);

// @route   GET /api/badges/my
router.get('/my', getMyBadges);

// @route   GET /api/badges/:id
router.get('/:id', getBadgeById);

module.exports = router;