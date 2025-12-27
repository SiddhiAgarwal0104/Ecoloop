const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
  createLendItem,
  browseItems,
  getItem,
  getMyItems,
  updateItem,
  deleteItem,
  getMatchedItems
} = require('../controllers/lend.controller');

// All routes are protected
router.use(protect);

// Browse items (all roles can browse)
router.get('/browse', browseItems);
router.get('/item/:id', getItem);

// Household actions
router.post('/create', authorize('household'), upload.array('images', 5), createLendItem);
router.get('/my-items', getMyItems);
router.put('/item/:id', authorize('household'), updateItem);
router.delete('/item/:id', authorize('household'), deleteItem);

// NGO/Recycler specific - get matched items
router.get('/matched', authorize('ngo', 'recycler'), getMatchedItems);

module.exports = router;