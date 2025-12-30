const WasteLog = require('../models/WasteLog');
const Locality = require('../models/Locality');
const NGO = require('../models/NGO');
const Recycler = require('../models/Recycler');
const { startOfMonth, endOfMonth, subMonths, format } = require('date-fns');

/**
 * @desc    Get dashboard overview statistics
 * @route   GET /api/admin/analytics/dashboard
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfCurrentMonth = startOfMonth(currentDate);
    const startOfLastMonth = startOfMonth(subMonths(currentDate, 1));
    const endOfLastMonth = endOfMonth(subMonths(currentDate, 1));

    // Get admin's assigned city
    const adminCity = req.admin.assignedCity;

    // Get localities in admin's city
    const adminLocalities = await Locality.find({ city: adminCity }).select('_id');
    const localityIds = adminLocalities.map(loc => loc._id);

    // Get current month stats (filtered by city)
    const currentMonthStats = await WasteLog.aggregate([
      {
        $match: {
          date: { $gte: startOfCurrentMonth },
          localityId: { $in: localityIds }
        }
      },
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          totalWaste: { $sum: '$weight' },
          totalCO2Saved: { $sum: '$impactMetrics.co2Saved' },
          totalEnergySaved: { $sum: '$impactMetrics.energySaved' },
          totalLandfillReduced: { $sum: '$impactMetrics.landfillReduced' }
        }
      }
    ]);

    // Get last month stats for comparison (filtered by city)
    const lastMonthStats = await WasteLog.aggregate([
      {
        $match: {
          date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          localityId: { $in: localityIds }
        }
      },
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          totalWaste: { $sum: '$weight' }
        }
      }
    ]);

    // Get total localities, NGOs, recyclers (filtered by city)
    const [totalLocalities, activeLocalities, totalNGOs, activeNGOs, totalRecyclers, activeRecyclers] = 
      await Promise.all([
        Locality.countDocuments({ city: adminCity }),
        Locality.countDocuments({ city: adminCity, isActive: true }),
        NGO.countDocuments({ city: adminCity }),
        NGO.countDocuments({ city: adminCity, isActive: true, isVerified: true }),
        Recycler.countDocuments({ city: adminCity }),
        Recycler.countDocuments({ city: adminCity, isActive: true, isVerified: true })
      ]);

    // Calculate growth percentages
    const currentStats = currentMonthStats[0] || {
      totalLogs: 0,
      totalWaste: 0,
      totalCO2Saved: 0,
      totalEnergySaved: 0,
      totalLandfillReduced: 0
    };

    const lastStats = lastMonthStats[0] || { totalLogs: 0, totalWaste: 0 };

    const logsGrowth = lastStats.totalLogs > 0 
      ? ((currentStats.totalLogs - lastStats.totalLogs) / lastStats.totalLogs * 100).toFixed(2)
      : 0;

    const wasteGrowth = lastStats.totalWaste > 0
      ? ((currentStats.totalWaste - lastStats.totalWaste) / lastStats.totalWaste * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        currentMonth: {
          totalLogs: currentStats.totalLogs,
          totalWaste: currentStats.totalWaste.toFixed(2),
          totalCO2Saved: currentStats.totalCO2Saved.toFixed(2),
          totalEnergySaved: currentStats.totalEnergySaved.toFixed(2),
          totalLandfillReduced: currentStats.totalLandfillReduced.toFixed(2)
        },
        growth: {
          logs: logsGrowth,
          waste: wasteGrowth
        },
        overview: {
          localities: {
            total: totalLocalities,
            active: activeLocalities
          },
          ngos: {
            total: totalNGOs,
            active: activeNGOs
          },
          recyclers: {
            total: totalRecyclers,
            active: activeRecyclers
          }
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard stats',
      error: error.message
    });
  }
};

/**
 * @desc    Get waste trends over time
 * @route   GET /api/admin/analytics/waste-trends
 * @access  Private/Admin
 */
const getWasteTrends = async (req, res) => {
  try {
    const { period = 'month', months = 6 } = req.query;
    
    const startDate = subMonths(new Date(), parseInt(months));

    const trends = await WasteLog.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            wasteType: '$wasteType'
          },
          totalWeight: { $sum: '$weight' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format data for frontend charts
    const formattedTrends = trends.reduce((acc, item) => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          dry: 0,
          wet: 0,
          'e-waste': 0,
          total: 0
        };
      }
      
      acc[monthKey][item._id.wasteType] = parseFloat(item.totalWeight.toFixed(2));
      acc[monthKey].total += item.totalWeight;
      
      return acc;
    }, {});

    const result = Object.values(formattedTrends).map(item => ({
      ...item,
      total: parseFloat(item.total.toFixed(2))
    }));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get waste trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching waste trends',
      error: error.message
    });
  }
};

/**
 * @desc    Get waste distribution by type
 * @route   GET /api/admin/analytics/waste-distribution
 * @access  Private/Admin
 */
const getWasteDistribution = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchCondition = {};
    if (startDate && endDate) {
      matchCondition.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const distribution = await WasteLog.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$wasteType',
          totalWeight: { $sum: '$weight' },
          count: { $sum: 1 },
          totalCO2Saved: { $sum: '$impactMetrics.co2Saved' },
          totalEnergySaved: { $sum: '$impactMetrics.energySaved' }
        }
      }
    ]);

    const formattedDistribution = distribution.map(item => ({
      wasteType: item._id,
      weight: parseFloat(item.totalWeight.toFixed(2)),
      count: item.count,
      co2Saved: parseFloat(item.totalCO2Saved.toFixed(2)),
      energySaved: parseFloat(item.totalEnergySaved.toFixed(2))
    }));

    res.status(200).json({
      success: true,
      data: formattedDistribution
    });
  } catch (error) {
    console.error('Get waste distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching waste distribution',
      error: error.message
    });
  }
};

/**
 * @desc    Get top performing localities
 * @route   GET /api/admin/analytics/top-localities
 * @access  Private/Admin
 */
const getTopLocalities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topLocalities = await Locality.getTopPerformers(parseInt(limit));

    res.status(200).json({
      success: true,
      count: topLocalities.length,
      data: topLocalities
    });
  } catch (error) {
    console.error('Get top localities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching top localities',
      error: error.message
    });
  }
};

/**
 * @desc    Get low performing localities (needs attention)
 * @route   GET /api/admin/analytics/low-localities
 * @access  Private/Admin
 */
const getLowPerformingLocalities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const lowLocalities = await Locality.getLowPerformers(parseInt(limit));

    res.status(200).json({
      success: true,
      count: lowLocalities.length,
      data: lowLocalities
    });
  } catch (error) {
    console.error('Get low performing localities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching low performing localities',
      error: error.message
    });
  }
};

/**
 * @desc    Get platform-wide statistics
 * @route   GET /api/admin/analytics/platform-stats
 * @access  Private/Admin
 */
const getPlatformStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : subMonths(new Date(), 12);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await WasteLog.getPlatformStats(start, end);

    const result = stats[0] || {
      totalWeight: 0,
      totalCO2Saved: 0,
      totalEnergySaved: 0,
      totalLandfillReduced: 0,
      totalLogs: 0
    };

    res.status(200).json({
      success: true,
      data: {
        totalWasteLogged: parseFloat(result.totalWeight.toFixed(2)),
        totalCO2Saved: parseFloat(result.totalCO2Saved.toFixed(2)),
        totalEnergySaved: parseFloat(result.totalEnergySaved.toFixed(2)),
        totalLandfillReduced: parseFloat(result.totalLandfillReduced.toFixed(2)),
        totalLogs: result.totalLogs,
        dateRange: {
          start: format(start, 'yyyy-MM-dd'),
          end: format(end, 'yyyy-MM-dd')
        }
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching platform stats',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getWasteTrends,
  getWasteDistribution,
  getTopLocalities,
  getLowPerformingLocalities,
  getPlatformStats
};