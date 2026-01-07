const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');

/**
 * Public Donation Routes - For Recycler Integration
 * These endpoints do NOT require authentication
 * Used by recycler backend to fetch available donations
 */

/**
 * Get all available donations
 * @route GET /api/public/donations
 * @query {string} status - Filter by status (AVAILABLE, PENDING, ACCEPTED, COMPLETED)
 * @query {number} limit - Results limit (default: 10)
 * @query {number} page - Page number (default: 1)
 * @returns {Array} List of donations
 */
router.get('/', async (req, res, next) => {
  try {
    const { status = 'AVAILABLE', limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Fetch donations
    const donations = await Donation.find(filter)
      .select('-createdAt -updatedAt')
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Donation.countDocuments(filter);

    console.log(`✅ Public: Fetched ${donations.length} donations with status=${status}`);

    res.status(200).json({
      success: true,
      data: donations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Public donations fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch donations'
    });
  }
});

/**
 * Get nearby donations
 * @route GET /api/public/donations/nearby
 * @query {number} latitude - User latitude
 * @query {number} longitude - User longitude
 * @query {number} radius - Search radius in km (default: 5)
 * @returns {Array} Nearby donations
 */
router.get('/nearby', async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5, limit = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const rad = parseFloat(radius);

    // Find donations within radius using geospatial query
    const donations = await Donation.find({
      status: 'AVAILABLE',
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [[lon, lat], rad / 6371] // Convert km to radians
        }
      }
    })
      .limit(parseInt(limit))
      .lean();

    console.log(`✅ Public: Found ${donations.length} nearby donations within ${radius}km`);

    res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('❌ Nearby donations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby donations'
    });
  }
});

/**
 * Get donation by ID (public access)
 * @route GET /api/public/donations/:id
 * @returns {Object} Donation details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id).lean();

    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('❌ Get donation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch donation'
    });
  }
});

module.exports = router;
