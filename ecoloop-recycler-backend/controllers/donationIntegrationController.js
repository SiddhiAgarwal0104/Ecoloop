const axios = require('axios');
const RequestAcceptance = require('../models/RequestAcceptance');
const AppError = require('../utils/appError');

exports.getHouseholdDonations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = 'PENDING' } = req.query;
    const householdApiUrl = process.env.HOUSEHOLD_API_URL || 'http://localhost:5000/api';
    
    const response = await axios.get(`${householdApiUrl}/donations`, {
      params: { page, limit, status },
      timeout: 5000,
      headers: { 'Authorization': req.headers.authorization || '' }
    });

    const donations = response.data?.data || [];
    const total = response.data?.pagination?.total || donations.length;

    res.status(200).json({
      success: true,
      data: donations,
      pagination: {
        total, page: parseInt(page), limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      message: `${donations.length} household donations available`
    });
  } catch (error) {
    next(new AppError('Failed to fetch household donations. Household API may be unavailable.', 503));
  }
};

exports.getNearbyHouseholdDonations = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;
    if (!latitude || !longitude) {
      return next(new AppError('Please provide latitude and longitude', 400));
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const searchRadius = parseFloat(radius);

    if (isNaN(lat) || isNaN(lon) || isNaN(searchRadius)) {
      return next(new AppError('Invalid coordinates or radius', 400));
    }

    const householdApiUrl = process.env.HOUSEHOLD_API_URL || 'http://localhost:5000/api';

    const response = await axios.get(`${householdApiUrl}/donations/nearby`, {
      params: { latitude: lat, longitude: lon, radius: searchRadius },
      timeout: 5000,
      headers: { 'Authorization': req.headers.authorization || '' }
    });

    const donations = response.data?.data || [];

    res.status(200).json({
      success: true,
      data: donations,
      message: `${donations.length} donations found within ${searchRadius}km`
    });
  } catch (error) {
    next(new AppError('Failed to fetch nearby donations', 503));
  }
};

exports.acceptHouseholdDonation = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const recyclerId = req.user?.id;

    if (!recyclerId) {
      return next(new AppError('Recycler ID not found in request', 401));
    }

    if (!donationId) {
      return next(new AppError('Donation ID is required', 400));
    }

    const householdApiUrl = process.env.HOUSEHOLD_API_URL || 'http://localhost:5000/api';

    const response = await axios.post(
      `${householdApiUrl}/donations/${donationId}/accept`,
      { acceptedBy: recyclerId },
      {
        timeout: 5000,
        headers: { 'Authorization': req.headers.authorization || '' }
      }
    );

    const donation = response.data?.data;
    if (!donation) {
      return next(new AppError('Donation not found or already accepted', 404));
    }

    const acceptance = await RequestAcceptance.create({
      householdDonationId: donationId,
      wasteType: donation.wasteType || 'Unspecified',
      quantity: donation.quantity || '1 unit',
      description: donation.description || '',
      pickupLocation: {
        address: donation.pickupLocation?.address || 'Not specified',
        latitude: donation.pickupLocation?.latitude || 0,
        longitude: donation.pickupLocation?.longitude || 0
      },
      createdBy: donation.createdBy,
      acceptedBy: recyclerId,
      scheduledDate: donation.scheduledDate || new Date(),
      status: 'ACCEPTED',
      notes: `Accepted from household donation system`
    });

    res.status(201).json({
      success: true,
      data: acceptance,
      message: 'Donation accepted successfully. You can now track and manage it.'
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return next(new AppError('Donation not found', 404));
    }
    next(new AppError('Failed to accept donation', 500));
  }
};

exports.updateHouseholdDonationStatus = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const { status, notes = '' } = req.body;

    if (!donationId) {
      return next(new AppError('Donation ID is required', 400));
    }

    const validStatuses = ['PICKED_UP', 'RECYCLED', 'CANCELLED', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      return next(new AppError(`Status must be one of: ${validStatuses.join(', ')}`, 400));
    }

    const householdApiUrl = process.env.HOUSEHOLD_API_URL || 'http://localhost:5000/api';

    const response = await axios.patch(
      `${householdApiUrl}/donations/${donationId}`,
      { status, notes },
      {
        timeout: 5000,
        headers: { 'Authorization': req.headers.authorization || '' }
      }
    );

    const updated = await RequestAcceptance.findOneAndUpdate(
      { householdDonationId: donationId },
      { status, notes: notes || `Status updated to ${status}` },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updated || response.data?.data,
      message: `Donation marked as ${status} successfully`
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return next(new AppError('Donation not found', 404));
    }
    next(new AppError('Failed to update donation status', 500));
  }
};

exports.getMyHouseholdDonations = async (req, res, next) => {
  try {
    const recyclerId = req.user?.id;

    if (!recyclerId) {
      return next(new AppError('Recycler ID not found', 401));
    }

    const donations = await RequestAcceptance.find({
      acceptedBy: recyclerId,
      householdDonationId: { $exists: true }
    }).sort({ acceptedAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: donations,
      count: donations.length,
      message: `You have accepted ${donations.length} household donations`
    });
  } catch (error) {
    next(error);
  }
};

exports.getHouseholdDonationDetails = async (req, res, next) => {
  try {
    const { donationId } = req.params;

    if (!donationId) {
      return next(new AppError('Donation ID is required', 400));
    }

    const householdApiUrl = process.env.HOUSEHOLD_API_URL || 'http://localhost:5000/api';

    const response = await axios.get(`${householdApiUrl}/donations/${donationId}`, {
      timeout: 5000,
      headers: { 'Authorization': req.headers.authorization || '' }
    });

    const donation = response.data?.data;

    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return next(new AppError('Donation not found', 404));
    }
    next(new AppError('Failed to fetch donation details', 500));
  }
};

exports.searchHouseholdDonations = async (req, res, next) => {
  try {
    const { wasteType, maxDistance = 10, city = '' } = req.query;

    if (!wasteType) {
      return next(new AppError('Waste type is required for search', 400));
    }

    const householdApiUrl = process.env.HOUSEHOLD_API_URL || 'http://localhost:5000/api';

    const response = await axios.get(`${householdApiUrl}/donations/search`, {
      params: { wasteType, maxDistance, city },
      timeout: 5000,
      headers: { 'Authorization': req.headers.authorization || '' }
    });

    const donations = response.data?.data || [];

    res.status(200).json({
      success: true,
      data: donations,
      count: donations.length,
      message: `Found ${donations.length} ${wasteType} donations`
    });
  } catch (error) {
    next(new AppError('Failed to search donations', 500));
  }
};

/**
 * Get nearby household donations based on recycler location
 * @route GET /api/integration/household-requests/nearby
 * @param {Object} req - Express request object
 * @param {number} req.query.latitude - Recycler latitude
 * @param {number} req.query.longitude - Recycler longitude
 * @param {number} req.query.radius - Search radius in km (default: 5)
 * @returns {Object} Nearby household donations sorted by distance
 */
exports.getNearbyHouseholdDonations = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    // Validation
    if (!latitude || !longitude) {
      return next(new AppError('Please provide latitude and longitude', 400));
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const searchRadius = parseFloat(radius);

    if (isNaN(lat) || isNaN(lon) || isNaN(searchRadius)) {
      return next(new AppError('Invalid coordinates or radius', 400));
    }

    const householdApiUrl = process.env.HOUSEHOLD_API_URL || 'http://localhost:5000/api';

    console.log(`📡 Fetching nearby donations within ${searchRadius}km of (${lat}, ${lon})`);

    // Fetch donations with nearby filter from household API
    const response = await axios.get(`${householdApiUrl}/donations/nearby`, {
      params: { latitude: lat, longitude: lon, radius: searchRadius },
      timeout: 5000,
      headers: {
        'Authorization': req.headers.authorization || ''
      }
    });

    const donations = response.data?.data || [];

    console.log(`✅ Found ${donations.length} nearby donations`);

    res.status(200).json({
      success: true,
      data: donations,
      message: `${donations.length} donations found within ${searchRadius}km`
    });
  } catch (error) {
    console.error('❌ Error fetching nearby donations:', error.message);
    next(new AppError('Failed to fetch nearby donations', 503));
  }
};

/**
 * Accept a household donation request
 * @route POST /api/integration/household-requests/:donationId/accept
 * @param {Object} req - Express request object
 * @param {string} req.params.donationId - Donation ID from household API
 * @param {string} req.user.id - Recycler ID
 * @returns {Object} Acceptance confirmation with donation details
 */
exports.acceptHouseholdDonation = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const recyclerId = req.user?.id;

    if (!recyclerId) {
      return next(new AppError('Recycler ID not found in request', 401));
    }

    if (!donationId) {
      return next(new AppError('Donation ID is required', 400));
    }

    const householdApiUrl = process.env.HOUSEHOLD_API_URL || 'http://localhost:5000/api';

    console.log(`📡 Accepting donation ${donationId} for recycler ${recyclerId}`);

    // Accept donation via household API
    const response = await axios.post(
      `${householdApiUrl}/donations/${donationId}/accept`,
      { acceptedBy: recyclerId },
      {
        timeout: 5000,
        headers: {
          'Authorization': req.headers.authorization || ''
        }
      }
    );

    const donation = response.data?.data;

    if (!donation) {
      return next(new AppError('Donation not found or already accepted', 404));
    }

    // Create record in recycler database for local tracking
    const acceptance = await RequestAcceptance.create({
      householdDonationId: donationId,
      wasteType: donation.wasteType || 'Unspecified',
      quantity: donation.quantity || '1 unit',
      description: donation.description || '',
      pickupLocation: {
        address: donation.pickupLocation?.address || 'Not specified',
        latitude: donation.pickupLocation?.latitude || 0,
        longitude: donation.pickupLocation?.longitude || 0
      },
      createdBy: donation.createdBy,
      acceptedBy: recyclerId,
      scheduledDate: donation.scheduledDate || new Date(),
      status: 'ACCEPTED',
      notes: `Accepted from household donation system`
    });

    console.log(`✅ Donation ${donationId} accepted successfully`);

    res.status(201).json({
      success: true,
      data: acceptance,
      message: 'Donation accepted successfully. You can now track and manage it.'
    });
  } catch (error) {
    console.error('❌ Error accepting donation:', error.message);
    if (error.response?.status === 404) {
      return next(new AppError('Donation not found', 404));
    }
    next(new AppError('Failed to accept donation', 500));
  }
};

/**
 * Update household donation status (picked up, recycled, etc.)
 * @route PATCH /api/integration/household-requests/:donationId/status
 * @param {Object} req - Express request object
 * @param {string} req.params.donationId - Donation ID
 * @param {string} req.body.status - New status (PICKED_UP, RECYCLED, CANCELLED)
 * @returns {Object} Updated donation status
 */
exports.updateHouseholdDonationStatus = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const { status, notes = '' } = req.body;

    if (!donationId) {
      return next(new AppError('Donation ID is required', 400));
    }

    const validStatuses = ['PICKED_UP', 'RECYCLED', 'CANCELLED', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      return next(new AppError(`Status must be one of: ${validStatuses.join(', ')}`, 400));
    }

    const householdApiUrl = process.env.HOUSEHOLD_API_URL || 'http://localhost:5000/api';

    console.log(`📡 Updating donation ${donationId} status to ${status}`);

    // Update status via household API
    const response = await axios.patch(
      `${householdApiUrl}/donations/${donationId}`,
      { status, notes },
      {
        timeout: 5000,
        headers: {
          'Authorization': req.headers.authorization || ''
        }
      }
    );

    // Also update in recycler database for local tracking
    const updated = await RequestAcceptance.findOneAndUpdate(
      { householdDonationId: donationId },
      { status, notes: notes || `Status updated to ${status}` },
      { new: true }
    );

    console.log(`✅ Donation ${donationId} status updated to ${status}`);

    res.status(200).json({
      success: true,
      data: updated || response.data?.data,
      message: `Donation marked as ${status} successfully`
    });
  } catch (error) {
    console.error('❌ Error updating donation status:', error.message);
    if (error.response?.status === 404) {
      return next(new AppError('Donation not found', 404));
    }
    next(new AppError('Failed to update donation status', 500));
  }
};

/**
 * Get all accepted donations for recycler
 * @route GET /api/integration/my-household-requests
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Recycler ID
 * @returns {Object} List of donations accepted by this recycler
 */
exports.getMyHouseholdDonations = async (req, res, next) => {
  try {
    const recyclerId = req.user?.id;

    if (!recyclerId) {
      return next(new AppError('Recycler ID not found', 401));
    }

    console.log(`📡 Fetching donations accepted by recycler ${recyclerId}`);

    // Fetch from local database
    const donations = await RequestAcceptance.find({
      acceptedBy: recyclerId,
      householdDonationId: { $exists: true }
    })
      .sort({ acceptedAt: -1 })
      .lean();

    console.log(`✅ Found ${donations.length} donations accepted by this recycler`);

    res.status(200).json({
      success: true,
      data: donations,
      count: donations.length,
      message: `You have accepted ${donations.length} household donations`
    });
  } catch (error) {
    console.error('❌ Error fetching my donations:', error.message);
    next(error);
  }
};

/**
 * Get donation details
 * @route GET /api/integration/household-requests/:donationId
 * @param {Object} req - Express request object
 * @param {string} req.params.donationId - Donation ID
 * @returns {Object} Detailed donation information
 */
exports.getHouseholdDonationDetails = async (req, res, next) => {
  try {
    const { donationId } = req.params;

    if (!donationId) {
      return next(new AppError('Donation ID is required', 400));
    }

    const householdApiUrl = process.env.HOUSEHOLD_API_URL || 'http://localhost:5000/api';

    console.log(`📡 Fetching details for donation ${donationId}`);

    // Get from household API
    const response = await axios.get(`${householdApiUrl}/donations/${donationId}`, {
      timeout: 5000,
      headers: {
        'Authorization': req.headers.authorization || ''
      }
    });

    const donation = response.data?.data;

    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }

    console.log(`✅ Retrieved donation details`);

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('❌ Error fetching donation details:', error.message);
    if (error.response?.status === 404) {
      return next(new AppError('Donation not found', 404));
    }
    next(new AppError('Failed to fetch donation details', 500));
  }
};

/**
 * Search household donations by waste type
 * @route GET /api/integration/household-requests/search
 * @param {Object} req - Express request object
 * @param {string} req.query.wasteType - Waste type to search for
 * @param {number} req.query.maxDistance - Maximum distance in km
 * @returns {Object} Filtered household donations
 */
exports.searchHouseholdDonations = async (req, res, next) => {
  try {
    const { wasteType, maxDistance = 10, city = '' } = req.query;

    if (!wasteType) {
      return next(new AppError('Waste type is required for search', 400));
    }

    const householdApiUrl = process.env.HOUSEHOLD_API_URL || 'http://localhost:5000/api';

    console.log(`📡 Searching for ${wasteType} donations`);

    // Search via household API
    const response = await axios.get(`${householdApiUrl}/donations/search`, {
      params: { wasteType, maxDistance, city },
      timeout: 5000,
      headers: {
        'Authorization': req.headers.authorization || ''
      }
    });

    const donations = response.data?.data || [];

    console.log(`✅ Found ${donations.length} matching donations`);

    res.status(200).json({
      success: true,
      data: donations,
      count: donations.length,
      message: `Found ${donations.length} ${wasteType} donations`
    });
  } catch (error) {
    console.error('❌ Error searching donations:', error.message);
    next(new AppError('Failed to search donations', 500));
  }
};
