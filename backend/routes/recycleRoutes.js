const express = require('express');
const router = express.Router();
const {
  createRecycleRequest,
  getMyRecycleRequests,
  getRecycleRequestById,
  updateRecycleRequest,
  deleteRecycleRequest,
  getAvailableRecycles,
  acceptRecycle
} = require('../controllers/recycleController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route - NO authentication required
router.get('/available', getAvailableRecycles);

// Accept route - Protected by authentication only (can be called by recycler backend)
router.post('/:id/accept', protect, acceptRecycle);

// Protected routes below - Authentication + HOUSEHOLD role required
router.use(protect);
router.use(restrictTo('HOUSEHOLD'));

// Routes
router.post('/', upload.array('images', 5), createRecycleRequest);
router.get('/my', getMyRecycleRequests);
router.get('/:id', getRecycleRequestById);
router.put('/:id', upload.array('images', 5), updateRecycleRequest);
router.delete('/:id', deleteRecycleRequest);

module.exports = router;
