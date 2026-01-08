const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  submitNGORating,
  getNGORatings,
  getNGOsRatingSummary,
  deleteRating
} = require('../controllers/ngoRatingController');

// @route   POST /api/ngo-ratings/submit
// @desc    Submit rating and feedback for NGO
// @access  Private (Household users only)
router.post('/submit', protect, restrictTo('HOUSEHOLD'), submitNGORating);

// @route   GET /api/ngo-ratings/admin/summary
// @desc    Get rating summary for all NGOs (Admin)
// @access  Private (Admin only)
router.get('/admin/summary', protect, restrictTo('ADMIN'), getNGOsRatingSummary);

// @route   GET /api/ngo-ratings/:ngoId
// @desc    Get all ratings for an NGO
// @access  Private (NGO can see own, Admin can see all)
router.get('/:ngoId', protect, getNGORatings);

// @route   DELETE /api/ngo-ratings/:ratingId
// @desc    Delete a rating (Admin only)
// @access  Private (Admin only)
router.delete('/:ratingId', protect, restrictTo('ADMIN'), deleteRating);

module.exports = router;
