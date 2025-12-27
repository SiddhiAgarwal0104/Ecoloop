const WasteLog = require('../models/WasteLog');
const Locality = require('../models/Locality');
const { subMonths, format } = require('date-fns');

/**
 * @desc    Get overall sustainability impact metrics
 * @route   GET /api/admin/sustainability/impact
 * @access  Private/Admin
 */
const getImpactMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : subMonths(new Date(), 12);
    const end = endDate ? new Date(endDate) : new Date();

    // Get aggregated impact data
    const impactData = await WasteLog.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalWaste: { $sum: '$weight' },
          totalCO2Saved: { $sum: '$impactMetrics.co2Saved' },
          totalEnergySaved: { $sum: '$impactMetrics.energySaved' },
          totalLandfillReduced: { $sum: '$impactMetrics.landfillReduced' },
          totalLogs: { $sum: 1 }
        }
      }
    ]);

    const result = impactData[0] || {
      totalWaste: 0,
      totalCO2Saved: 0,
      totalEnergySaved: 0,
      totalLandfillReduced: 0,
      totalLogs: 0
    };

    // Calculate equivalent metrics for better understanding
    const treesEquivalent = (result.totalCO2Saved / 21).toFixed(0); // ~21kg CO2 per tree/year
    const homesEquivalent = (result.totalEnergySaved / 10950).toFixed(2); // ~10,950 kWh per home/year
    const trucksEquivalent = (result.totalLandfillReduced / 5000).toFixed(2); // ~5 tons per truck

    res.status(200).json({
      success: true,
      data: {
        period: {
          start: format(start, 'yyyy-MM-dd'),
          end: format(end, 'yyyy-MM-dd')
        },
        metrics: {
          totalWasteLogged: parseFloat(result.totalWaste.toFixed(2)),
          totalCO2Saved: parseFloat(result.totalCO2Saved.toFixed(2)),
          totalEnergySaved: parseFloat(result.totalEnergySaved.toFixed(2)),
          totalLandfillReduced: parseFloat(result.totalLandfillReduced.toFixed(2)),
          totalLogs: result.totalLogs
        },
        equivalents: {
          treesPlanted: parseInt(treesEquivalent),
          homesPoweredYearly: parseFloat(homesEquivalent),
          trucksFilled: parseFloat(trucksEquivalent)
        }
      }
    });
  } catch (error) {
    console.error('Get impact metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching impact metrics',
      error: error.message
    });
  }
};

/**
 * @desc    Get impact trends over time (monthly breakdown)
 * @route   GET /api/admin/sustainability/trends
 * @access  Private/Admin
 */
const getImpactTrends = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    
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
            month: { $month: '$date' }
          },
          totalWaste: { $sum: '$weight' },
          totalCO2: { $sum: '$impactMetrics.co2Saved' },
          totalEnergy: { $sum: '$impactMetrics.energySaved' },
          totalLandfill: { $sum: '$impactMetrics.landfillReduced' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const formattedTrends = trends.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      waste: parseFloat(item.totalWaste.toFixed(2)),
      co2Saved: parseFloat(item.totalCO2.toFixed(2)),
      energySaved: parseFloat(item.totalEnergy.toFixed(2)),
      landfillReduced: parseFloat(item.totalLandfill.toFixed(2)),
      logs: item.count
    }));

    res.status(200).json({
      success: true,
      count: formattedTrends.length,
      data: formattedTrends
    });
  } catch (error) {
    console.error('Get impact trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching impact trends',
      error: error.message
    });
  }
};

/**
 * @desc    Get impact by waste type
 * @route   GET /api/admin/sustainability/by-waste-type
 * @access  Private/Admin
 */
const getImpactByWasteType = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : subMonths(new Date(), 12);
    const end = endDate ? new Date(endDate) : new Date();

    const impactByType = await WasteLog.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$wasteType',
          totalWaste: { $sum: '$weight' },
          totalCO2: { $sum: '$impactMetrics.co2Saved' },
          totalEnergy: { $sum: '$impactMetrics.energySaved' },
          totalLandfill: { $sum: '$impactMetrics.landfillReduced' },
          avgCO2PerKg: { $avg: '$impactMetrics.co2Saved' },
          avgEnergyPerKg: { $avg: '$impactMetrics.energySaved' }
        }
      }
    ]);

    const formatted = impactByType.map(item => ({
      wasteType: item._id,
      totalWaste: parseFloat(item.totalWaste.toFixed(2)),
      co2Saved: parseFloat(item.totalCO2.toFixed(2)),
      energySaved: parseFloat(item.totalEnergy.toFixed(2)),
      landfillReduced: parseFloat(item.totalLandfill.toFixed(2)),
      avgCO2PerKg: parseFloat(item.avgCO2PerKg.toFixed(3)),
      avgEnergyPerKg: parseFloat(item.avgEnergyPerKg.toFixed(3))
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Get impact by waste type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching impact by waste type',
      error: error.message
    });
  }
};

/**
 * @desc    Get impact by locality (top contributors)
 * @route   GET /api/admin/sustainability/by-locality
 * @access  Private/Admin
 */
const getImpactByLocality = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : subMonths(new Date(), 12);
    const end = endDate ? new Date(endDate) : new Date();

    const impactByLocality = await WasteLog.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$localityId',
          totalWaste: { $sum: '$weight' },
          totalCO2: { $sum: '$impactMetrics.co2Saved' },
          totalEnergy: { $sum: '$impactMetrics.energySaved' },
          totalLandfill: { $sum: '$impactMetrics.landfillReduced' }
        }
      },
      {
        $sort: { totalCO2: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'localities',
          localField: '_id',
          foreignField: '_id',
          as: 'localityDetails'
        }
      },
      {
        $unwind: '$localityDetails'
      }
    ]);

    const formatted = impactByLocality.map(item => ({
      locality: {
        id: item._id,
        name: item.localityDetails.name,
        city: item.localityDetails.city,
        state: item.localityDetails.state
      },
      impact: {
        totalWaste: parseFloat(item.totalWaste.toFixed(2)),
        co2Saved: parseFloat(item.totalCO2.toFixed(2)),
        energySaved: parseFloat(item.totalEnergy.toFixed(2)),
        landfillReduced: parseFloat(item.totalLandfill.toFixed(2))
      }
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Get impact by locality error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching impact by locality',
      error: error.message
    });
  }
};

/**
 * @desc    Get monthly sustainability summary
 * @route   GET /api/admin/sustainability/monthly-summary
 * @access  Private/Admin
 */
const getMonthlySummary = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const summary = await WasteLog.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalWaste: { $sum: '$weight' },
          totalCO2: { $sum: '$impactMetrics.co2Saved' },
          totalEnergy: { $sum: '$impactMetrics.energySaved' },
          totalLandfill: { $sum: '$impactMetrics.landfillReduced' },
          totalLogs: { $sum: 1 }
        }
      }
    ]);

    const result = summary[0] || {
      totalWaste: 0,
      totalCO2: 0,
      totalEnergy: 0,
      totalLandfill: 0,
      totalLogs: 0
    };

    // Get active localities count
    const activeLocalities = await Locality.countDocuments({
      isActive: true,
      lastActivityDate: { $gte: startOfMonth }
    });

    res.status(200).json({
      success: true,
      data: {
        month: format(currentDate, 'MMMM yyyy'),
        summary: {
          totalWaste: parseFloat(result.totalWaste.toFixed(2)),
          co2Saved: parseFloat(result.totalCO2.toFixed(2)),
          energySaved: parseFloat(result.totalEnergy.toFixed(2)),
          landfillReduced: parseFloat(result.totalLandfill.toFixed(2)),
          totalLogs: result.totalLogs,
          activeLocalities
        }
      }
    });
  } catch (error) {
    console.error('Get monthly summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching monthly summary',
      error: error.message
    });
  }
};

module.exports = {
  getImpactMetrics,
  getImpactTrends,
  getImpactByWasteType,
  getImpactByLocality,
  getMonthlySummary
};