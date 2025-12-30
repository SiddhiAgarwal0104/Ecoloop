const LendingRequest = require('../models/LendingRequest');
const Locality = require('../models/Locality');
const { subMonths } = require('date-fns');

/**
 * @desc    Get overall community sharing statistics
 * @route   GET /api/admin/community/stats
 * @access  Private/Admin
 */
const getCommunityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : subMonths(new Date(), 12);
    const end = endDate ? new Date(endDate) : new Date();

    // Get overall stats
    const stats = await LendingRequest.aggregate([
      {
        $match: {
          createdDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          completedSharing: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          pendingRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          cancelledRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalRequests: 0,
      completedSharing: 0,
      pendingRequests: 0,
      cancelledRequests: 0
    };

    // Get unique users engaged
    const uniqueUsers = await LendingRequest.aggregate([
      {
        $match: {
          createdDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$userId'
        }
      },
      {
        $count: 'count'
      }
    ]);

    const userCount = uniqueUsers[0]?.count || 0;

    // Calculate this month stats
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    const thisMonthStats = await LendingRequest.aggregate([
      {
        $match: {
          createdDate: { $gte: thisMonthStart },
          status: 'completed'
        }
      },
      {
        $count: 'count'
      }
    ]);

    const thisMonthCount = thisMonthStats[0]?.count || 0;

    res.status(200).json({
      success: true,
      data: {
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        stats: {
          totalRequests: result.totalRequests,
          completedSharing: result.completedSharing,
          pendingRequests: result.pendingRequests,
          cancelledRequests: result.cancelledRequests,
          activeUsers: userCount,
          thisMonthCompleted: thisMonthCount
        },
        successRate: result.totalRequests > 0 
          ? ((result.completedSharing / result.totalRequests) * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error('Get community stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching community stats',
      error: error.message
    });
  }
};

/**
 * @desc    Get community sharing stats by locality
 * @route   GET /api/admin/community/by-locality
 * @access  Private/Admin
 */
const getCommunityByLocality = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : subMonths(new Date(), 12);
    const end = endDate ? new Date(endDate) : new Date();

    const localityStats = await LendingRequest.aggregate([
      {
        $match: {
          createdDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$localityId',
          totalRequests: { $sum: 1 },
          completedSharing: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          pendingRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          activeUsers: {
            $addToSet: '$userId'
          }
        }
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
      },
      {
        $project: {
          localityId: '$_id',
          localityName: '$localityDetails.name',
          city: '$localityDetails.city',
          totalRequests: 1,
          completedSharing: 1,
          pendingRequests: 1,
          activeUsers: { $size: '$activeUsers' },
          successRate: {
            $cond: [
              { $gt: ['$totalRequests', 0] },
              { $multiply: [{ $divide: ['$completedSharing', '$totalRequests'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $sort: { completedSharing: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: localityStats.length,
      data: localityStats.map(item => ({
        localityId: item.localityId,
        localityName: item.localityName,
        city: item.city,
        totalRequests: item.totalRequests,
        completedSharing: item.completedSharing,
        pendingRequests: item.pendingRequests,
        activeUsers: item.activeUsers,
        successRate: parseFloat(item.successRate.toFixed(2))
      }))
    });
  } catch (error) {
    console.error('Get community by locality error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching community by locality',
      error: error.message
    });
  }
};

/**
 * @desc    Get community sharing trends (monthly)
 * @route   GET /api/admin/community/trends
 * @access  Private/Admin
 */
const getCommunityTrends = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const startDate = subMonths(new Date(), parseInt(months));

    const trends = await LendingRequest.aggregate([
      {
        $match: {
          createdDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdDate' },
            month: { $month: '$createdDate' }
          },
          totalRequests: { $sum: 1 },
          completedSharing: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          pendingRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const formattedTrends = trends.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      totalRequests: item.totalRequests,
      completedSharing: item.completedSharing,
      pendingRequests: item.pendingRequests,
      successRate: item.totalRequests > 0 
        ? parseFloat(((item.completedSharing / item.totalRequests) * 100).toFixed(2))
        : 0
    }));

    res.status(200).json({
      success: true,
      count: formattedTrends.length,
      data: formattedTrends
    });
  } catch (error) {
    console.error('Get community trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching community trends',
      error: error.message
    });
  }
};

/**
 * @desc    Get community sharing by category
 * @route   GET /api/admin/community/by-category
 * @access  Private/Admin
 */
const getCommunityByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : subMonths(new Date(), 12);
    const end = endDate ? new Date(endDate) : new Date();

    const categoryStats = await LendingRequest.aggregate([
      {
        $match: {
          createdDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          totalRequests: { $sum: 1 },
          completedSharing: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { totalRequests: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: categoryStats.length,
      data: categoryStats.map(item => ({
        category: item._id,
        totalRequests: item.totalRequests,
        completedSharing: item.completedSharing,
        successRate: item.totalRequests > 0
          ? parseFloat(((item.completedSharing / item.totalRequests) * 100).toFixed(2))
          : 0
      }))
    });
  } catch (error) {
    console.error('Get community by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching community by category',
      error: error.message
    });
  }
};

module.exports = {
  getCommunityStats,
  getCommunityByLocality,
  getCommunityTrends,
  getCommunityByCategory
};
