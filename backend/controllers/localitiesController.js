const Locality = require('../models/Locality');
const WasteLog = require('../models/WasteLog');
const { subMonths } = require('date-fns');

/**
 * @desc    Get all localities with pagination
 * @route   GET /api/admin/localities
 * @access  Private/Admin
 */
const getAllLocalities = async (req, res) => {
  try {
    const { page = 1, limit = 10, city, state, isActive } = req.query;

    const query = {};
    if (city) query.city = new RegExp(city, 'i');
    if (state) query.state = new RegExp(state, 'i');
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const localities = await Locality.find(query)
      .populate('assignedNGOs', 'name email phone')
      .populate('assignedRecyclers', 'name email phone facilityType')
      .sort({ participationRate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Locality.countDocuments(query);

    res.status(200).json({
      success: true,
      count: localities.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: localities
    });
  } catch (error) {
    console.error('Get all localities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching localities',
      error: error.message
    });
  }
};

/**
 * @desc    Get single locality by ID
 * @route   GET /api/admin/localities/:id
 * @access  Private/Admin
 */
const getLocalityById = async (req, res) => {
  try {
    const locality = await Locality.findById(req.params.id)
      .populate('assignedNGOs', 'name email phone rating performanceMetrics')
      .populate('assignedRecyclers', 'name email phone facilityType rating performanceMetrics');

    if (!locality) {
      return res.status(404).json({
        success: false,
        message: 'Locality not found'
      });
    }

    res.status(200).json({
      success: true,
      data: locality
    });
  } catch (error) {
    console.error('Get locality by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching locality',
      error: error.message
    });
  }
};

/**
 * @desc    Get locality statistics
 * @route   GET /api/admin/localities/:id/stats
 * @access  Private/Admin
 */
const getLocalityStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : subMonths(new Date(), 6);
    const end = endDate ? new Date(endDate) : new Date();

    const locality = await Locality.findById(id);

    if (!locality) {
      return res.status(404).json({
        success: false,
        message: 'Locality not found'
      });
    }

    // Get waste stats using WasteLog model's static method
    const wasteStats = await WasteLog.getLocalityStats(id, start, end);

    // Get monthly trends
    const monthlyTrends = await WasteLog.aggregate([
      {
        $match: {
          localityId: locality._id,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalWeight: { $sum: '$weight' },
          totalCO2: { $sum: '$impactMetrics.co2Saved' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        locality: {
          name: locality.name,
          city: locality.city,
          participationRate: locality.participationRate,
          totalHouseholds: locality.totalHouseholds,
          activeUsers: locality.activeUsers
        },
        wasteByType: wasteStats,
        monthlyTrends: monthlyTrends.map(item => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          weight: parseFloat(item.totalWeight.toFixed(2)),
          co2Saved: parseFloat(item.totalCO2.toFixed(2)),
          logs: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Get locality stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching locality stats',
      error: error.message
    });
  }
};

/**
 * @desc    Get localities by performance category
 * @route   GET /api/admin/localities/performance/:category
 * @access  Private/Admin
 */
const getLocalitiesByPerformance = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    let localities;

    switch (category) {
      case 'top':
        localities = await Locality.getTopPerformers(parseInt(limit));
        break;
      case 'low':
        localities = await Locality.getLowPerformers(parseInt(limit));
        break;
      case 'high-waste':
        localities = await Locality.find({ isActive: true })
          .sort({ 'wasteStats.totalWasteLogged': -1 })
          .limit(parseInt(limit))
          .select('name city state wasteStats participationRate');
        break;
      case 'inactive':
        localities = await Locality.find({ 
          isActive: true, 
          lastActivityDate: { $lt: subMonths(new Date(), 1) }
        })
          .sort({ lastActivityDate: 1 })
          .limit(parseInt(limit))
          .select('name city state lastActivityDate participationRate');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid performance category. Use: top, low, high-waste, inactive'
        });
    }

    res.status(200).json({
      success: true,
      category,
      count: localities.length,
      data: localities
    });
  } catch (error) {
    console.error('Get localities by performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching localities by performance',
      error: error.message
    });
  }
};

/**
 * @desc    Search localities
 * @route   GET /api/admin/localities/search
 * @access  Private/Admin
 */
const searchLocalities = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchRegex = new RegExp(query, 'i');

    const localities = await Locality.find({
      $or: [
        { name: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
        { pincode: searchRegex }
      ]
    })
      .select('name city state pincode participationRate wasteStats')
      .limit(20);

    res.status(200).json({
      success: true,
      count: localities.length,
      data: localities
    });
  } catch (error) {
    console.error('Search localities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching localities',
      error: error.message
    });
  }
};

module.exports = {
  getAllLocalities,
  getLocalityById,
  getLocalityStats,
  getLocalitiesByPerformance,
  searchLocalities
};