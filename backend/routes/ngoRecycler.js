const express = require('express');
const router = express.Router();
const {
  getAllNGOs,
  getNGOById,
  getTopNGOs,
  getNGOsNeedingAttention,
  getAllRecyclers,
  getRecyclerById,
  getTopRecyclers,
  getUnderutilizedRecyclers,
  getRecyclersByFacilityType
} = require('../controllers/ngoRecyclerController');

const { protect } = require('../middleware/auth');
const { apiRateLimiter } = require('../middleware/adminAuth');

// Apply authentication and rate limiting
router.use(protect);
router.use(apiRateLimiter);

// === NGO Routes ===

// NGO Performance
router.get('/ngos/performance/top', getTopNGOs);
router.get('/ngos/performance/attention', getNGOsNeedingAttention);

// Specific NGO
router.get('/ngos/:id', getNGOById);

// List all NGOs
router.get('/ngos', getAllNGOs);

// === Recycler Routes ===

// Recycler Performance
router.get('/recyclers/performance/top', getTopRecyclers);
router.get('/recyclers/performance/underutilized', getUnderutilizedRecyclers);

// Recycler by facility type
router.get('/recyclers/facility/:type', getRecyclersByFacilityType);

// Specific Recycler
router.get('/recyclers/:id', getRecyclerById);

// List all Recyclers
router.get('/recyclers', getAllRecyclers);

module.exports = router;