const express = require('express');
const router = express.Router();
const {
  createDonation,
  getMyDonations,
  getDonationById,
  updateDonation,
  deleteDonation
} = require('../controllers/donationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Apply authentication and role restriction to all routes
router.use(protect);
router.use(restrictTo('HOUSEHOLD'));

// IMPORTANT: Specific routes MUST come before parameterized routes
router.post('/', upload.array('images', 5), createDonation);
router.get('/my', getMyDonations);  // ← Must be BEFORE /:id

// Parameterized routes come last
router.get('/:id', getDonationById);
router.put('/:id', upload.array('images', 5), updateDonation);
router.delete('/:id', deleteDonation);

module.exports = router;