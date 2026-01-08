const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  submitRecyclerRating,
  getRecyclerRatings,
  deleteRecyclerRating
} = require('../controllers/recyclerRatingController');

const router = express.Router();

// Submit rating for a recycler
router.post('/submit', protect, restrictTo('HOUSEHOLD'), submitRecyclerRating);

// Get all ratings for a recycler
router.get('/:recyclerId', protect, getRecyclerRatings);

// Delete a rating (Admin only)
router.delete('/:ratingId', protect, restrictTo('ADMIN'), deleteRecyclerRating);

module.exports = router;
