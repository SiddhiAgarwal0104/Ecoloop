const express = require('express');
const router = express.Router();
const {
  createRecycleRequest,
  getMyRecycleRequests,
  getRecycleRequestById,
  updateRecycleRequest,
  deleteRecycleRequest
} = require('../controllers/recycleController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Apply authentication and role restriction to all routes
router.use(protect);
router.use(restrictTo('HOUSEHOLD'));

// Routes
router.post('/', upload.array('images', 5), createRecycleRequest);
router.get('/my', getMyRecycleRequests);
router.get('/:id', getRecycleRequestById);
router.put('/:id', upload.array('images', 5), updateRecycleRequest);
router.delete('/:id', deleteRecycleRequest);

module.exports = router;