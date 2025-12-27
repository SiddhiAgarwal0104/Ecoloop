const NGO = require('../models/NGO');
const Recycler = require('../models/Recycler');

/**
 * @desc    Get all NGOs with filtering
 * @route   GET /api/admin/ngos
 * @access  Private/Admin
 */
const getAllNGOs = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, isVerified, city, state } = req.query;

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');

    const ngos = await NGO.find(query)
      .populate('serviceAreas', 'name city state')
      .sort({ rating: -1, 'performanceMetrics.totalCollections': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await NGO.countDocuments(query);

    res.status(200).json({
      success: true,
      count: ngos.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: ngos
    });
  } catch (error) {
    console.error('Get all NGOs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching NGOs',
      error: error.message
    });
  }
};

/**
 * @desc    Get single NGO by ID
 * @route   GET /api/admin/ngos/:id
 * @access  Private/Admin
 */
const getNGOById = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id)
      .populate('serviceAreas', 'name city state totalHouseholds activeUsers');

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ngo
    });
  } catch (error) {
    console.error('Get NGO by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching NGO',
      error: error.message
    });
  }
};

/**
 * @desc    Get top performing NGOs
 * @route   GET /api/admin/ngos/performance/top
 * @access  Private/Admin
 */
const getTopNGOs = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topNGOs = await NGO.getTopPerformers(parseInt(limit));

    res.status(200).json({
      success: true,
      count: topNGOs.length,
      data: topNGOs
    });
  } catch (error) {
    console.error('Get top NGOs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching top NGOs',
      error: error.message
    });
  }
};

/**
 * @desc    Get NGOs needing attention
 * @route   GET /api/admin/ngos/performance/attention
 * @access  Private/Admin
 */
const getNGOsNeedingAttention = async (req, res) => {
  try {
    const ngos = await NGO.getNeedsAttention();

    res.status(200).json({
      success: true,
      count: ngos.length,
      data: ngos
    });
  } catch (error) {
    console.error('Get NGOs needing attention error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching NGOs needing attention',
      error: error.message
    });
  }
};

/**
 * @desc    Get all recyclers with filtering
 * @route   GET /api/admin/recyclers
 * @access  Private/Admin
 */
const getAllRecyclers = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, isVerified, facilityType, city, state } = req.query;

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (facilityType) query.facilityType = facilityType;
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');

    const recyclers = await Recycler.find(query)
      .populate('serviceAreas', 'name city state')
      .populate('partnerNGOs', 'name email')
      .sort({ rating: -1, 'performanceMetrics.totalMaterialProcessed': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Recycler.countDocuments(query);

    res.status(200).json({
      success: true,
      count: recyclers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: recyclers
    });
  } catch (error) {
    console.error('Get all recyclers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recyclers',
      error: error.message
    });
  }
};

/**
 * @desc    Get single recycler by ID
 * @route   GET /api/admin/recyclers/:id
 * @access  Private/Admin
 */
const getRecyclerById = async (req, res) => {
  try {
    const recycler = await Recycler.findById(req.params.id)
      .populate('serviceAreas', 'name city state totalHouseholds')
      .populate('partnerNGOs', 'name email phone rating');

    if (!recycler) {
      return res.status(404).json({
        success: false,
        message: 'Recycler not found'
      });
    }

    res.status(200).json({
      success: true,
      data: recycler
    });
  } catch (error) {
    console.error('Get recycler by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recycler',
      error: error.message
    });
  }
};

/**
 * @desc    Get top performing recyclers
 * @route   GET /api/admin/recyclers/performance/top
 * @access  Private/Admin
 */
const getTopRecyclers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topRecyclers = await Recycler.getTopPerformers(parseInt(limit));

    res.status(200).json({
      success: true,
      count: topRecyclers.length,
      data: topRecyclers
    });
  } catch (error) {
    console.error('Get top recyclers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching top recyclers',
      error: error.message
    });
  }
};

/**
 * @desc    Get underutilized recyclers
 * @route   GET /api/admin/recyclers/performance/underutilized
 * @access  Private/Admin
 */
const getUnderutilizedRecyclers = async (req, res) => {
  try {
    const recyclers = await Recycler.getUnderutilized();

    res.status(200).json({
      success: true,
      count: recyclers.length,
      data: recyclers.map(r => ({
        _id: r._id,
        name: r.name,
        facilityType: r.facilityType,
        capacity: r.capacity,
        performanceMetrics: r.performanceMetrics,
        capacityUtilization: r.capacityUtilization,
        address: r.address
      }))
    });
  } catch (error) {
    console.error('Get underutilized recyclers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching underutilized recyclers',
      error: error.message
    });
  }
};

/**
 * @desc    Get recyclers by facility type
 * @route   GET /api/admin/recyclers/facility/:type
 * @access  Private/Admin
 */
const getRecyclersByFacilityType = async (req, res) => {
  try {
    const { type } = req.params;

    const validTypes = ['recycling_plant', 'composting_unit', 'e-waste_facility', 'mixed'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid facility type. Valid types: ${validTypes.join(', ')}`
      });
    }

    const recyclers = await Recycler.getByFacilityType(type);

    res.status(200).json({
      success: true,
      facilityType: type,
      count: recyclers.length,
      data: recyclers
    });
  } catch (error) {
    console.error('Get recyclers by facility type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recyclers by facility type',
      error: error.message
    });
  }
};

module.exports = {
  getAllNGOs,
  getNGOById,
  getTopNGOs,
  getNGOsNeedingAttention,
  getAllRecyclers,
  getRecyclerById,
  getTopRecyclers,
  getUnderutilizedRecyclers,
  getRecyclersByFacilityType
};