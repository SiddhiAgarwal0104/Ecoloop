const mongoose = require('mongoose');
const Recycler = require('../models/Recycler');
const Recycle = require('../models/Recycle');
const RequestAcceptance = require('../models/RequestAcceptance');
const RecyclerReview = require('../models/RecyclerReview');
const AppError = require('../utils/appError');
const axios = require('axios');

/**
 * Get recycler dashboard data
 * @route GET /api/recycler/dashboard
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Recycler ID from token
 * @returns {Object} Dashboard data with stats and recent activity
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const recyclerId = req.user.id;
    console.log(`📊 Loading dashboard for recycler: ${recyclerId}`);

    // Fetch recycler data
    const recycler = await Recycler.findById(recyclerId).lean();
    if (!recycler) {
      return next(new AppError('Recycler not found', 404));
    }

    // Convert recyclerId to ObjectId for consistent querying
    const recyclerObjectId = new mongoose.Types.ObjectId(recyclerId);

    // Get request statistics from Recycle model
    const [totalAccepted, totalPickedUp, totalRecycled] = await Promise.all([
      Recycle.countDocuments({ assignedRecycler: recyclerObjectId, status: 'ACCEPTED' }),
      Recycle.countDocuments({ assignedRecycler: recyclerObjectId, status: 'PICKED_UP' }),
      Recycle.countDocuments({ assignedRecycler: recyclerObjectId, status: 'RECYCLED' })
    ]);

    console.log(`📈 Request counts - Accepted: ${totalAccepted}, PickedUp: ${totalPickedUp}, Recycled: ${totalRecycled}`);

    // Get recent requests from Recycle model
    const recentRequests = await Recycle.find({ assignedRecycler: recyclerObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    console.log(`📋 Recent requests fetched: ${recentRequests.length} items`);
    console.log(`   Request details:`, recentRequests.map(r => ({
      id: r._id,
      status: r.status,
      category: r.wasteCategory,
      quantity: r.quantity,
      createdAt: r.createdAt
    })));

    // Get average rating
    const reviews = await RecyclerReview.find({ recyclerId: recyclerObjectId }).lean();
    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // Get waste collected (only from RECYCLED items)
    const wasteCollectedAgg = await Recycle.aggregate([
      { $match: { assignedRecycler: recyclerObjectId, status: 'RECYCLED' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    
    const totalWasteCollected = wasteCollectedAgg.length > 0 ? wasteCollectedAgg[0].total : 0;

    // Get waste by category
    const wasteByCategory = await Recycle.aggregate([
      { $match: { assignedRecycler: recyclerObjectId, status: 'RECYCLED' } },
      { $group: { _id: '$category', quantity: { $sum: '$quantity' } } },
      { $project: { _id: 0, category: '$_id', quantity: 1 } }
    ]);

    // Get available requests from household backend
    let availableRequests = [];
    try {
      const response = await axios.get('http://localhost:5000/api/recycle/available');
      availableRequests = response.data.data || [];
    } catch (error) {
      console.warn('⚠️ Could not fetch available requests from household backend');
    }

    console.log(`✅ Dashboard data retrieved for recycler ${recyclerId}`);

    res.status(200).json({
      success: true,
      data: {
        profile: {
          name: recycler.name,
          email: recycler.email,
          phone: recycler.phone,
          profileImage: recycler.profileImage,
          bio: recycler.bio
        },
        stats: {
          totalRequests: totalAccepted,
          completedRequests: totalRecycled,
          completionRate: totalAccepted > 0 ? ((totalRecycled / totalAccepted) * 100).toFixed(2) : 0,
          totalWasteCollected: totalWasteCollected,
          rating: parseFloat(averageRating),
          reviewCount: reviews.length
        },
        requests: {
          accepted: totalAccepted,
          pickedUp: totalPickedUp,
          recycled: totalRecycled
        },
        recentRequests,
        recentRequestsCount: recentRequests.length,  // DEBUG: Add count for verification
        wasteByCategory,
        availableRequests
      }
    });
  } catch (error) {
    console.error('❌ Get dashboard error:', error);
    next(error);
  }
};

/**
 * Get performance metrics
 * @route GET /api/recycler/performance
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Recycler ID from token
 * @param {string} req.query.period - Time period (week, month, year, all)
 * @returns {Object} Performance metrics and trends
 */
exports.getPerformanceMetrics = async (req, res, next) => {
  try {
    const recyclerId = req.user.id;
    const { period = 'month' } = req.query;

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
      case 'month':
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }

    // Get requests in period
    const requestsInPeriod = await RequestAcceptance.find({
      recyclerId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();

    // Calculate metrics
    const totalRequests = requestsInPeriod.length;
    const completedRequests = requestsInPeriod.filter(r => r.status === 'RECYCLED').length;
    const completionRate = totalRequests > 0
      ? ((completedRequests / totalRequests) * 100).toFixed(2)
      : 0;

    // Waste collection metrics
    const totalWaste = requestsInPeriod
      .filter(r => r.status === 'RECYCLED')
      .reduce((sum, r) => sum + r.quantity, 0)
      .toFixed(2);

    // Average time to complete (in days)
    const completedWithTime = requestsInPeriod
      .filter(r => r.recycledAt && r.acceptedAt)
      .map(r => {
        const diffTime = Math.abs(r.recycledAt - r.acceptedAt);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      });

    const avgCompletionTime = completedWithTime.length > 0
      ? (completedWithTime.reduce((a, b) => a + b, 0) / completedWithTime.length).toFixed(1)
      : 0;

    // Get reviews in period
    const reviewsInPeriod = await RecyclerReview.find({
      recyclerId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();

    const avgRating = reviewsInPeriod.length > 0
      ? (reviewsInPeriod.reduce((sum, r) => sum + r.rating, 0) / reviewsInPeriod.length).toFixed(2)
      : 0;

    console.log(`✅ Performance metrics retrieved for period: ${period}`);

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { start: startDate, end: endDate },
        requests: {
          total: totalRequests,
          completed: completedRequests,
          pending: totalRequests - completedRequests,
          completionRate: parseFloat(completionRate)
        },
        waste: {
          total: parseFloat(totalWaste),
          unit: 'KG'
        },
        performance: {
          avgCompletionTime: parseFloat(avgCompletionTime),
          avgRating: parseFloat(avgRating),
          reviewCount: reviewsInPeriod.length
        }
      }
    });
  } catch (error) {
    console.error('❌ Get performance metrics error:', error);
    next(error);
  }
};

/**
 * Get detailed statistics
 * @route GET /api/recycler/statistics
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Recycler ID from token
 * @returns {Object} Detailed statistics and analytics
 */
exports.getStatistics = async (req, res, next) => {
  try {
    const recyclerId = req.user.id;

    // Waste collection by category (all time)
    const wasteByCategory = await RequestAcceptance.aggregate([
      { $match: { recyclerId, status: 'RECYCLED' } },
      { $group: { _id: '$wasteCategory', total: { $sum: '$quantity' } } },
      { $sort: { total: -1 } }
    ]);

    // Requests by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const requestsByMonth = await RequestAcceptance.aggregate([
      { $match: { recyclerId, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Status distribution
    const statusDistribution = await RequestAcceptance.aggregate([
      { $match: { recyclerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    console.log(`✅ Statistics retrieved for recycler ${recyclerId}`);

    res.status(200).json({
      success: true,
      data: {
        wasteByCategory,
        requestsByMonth,
        statusDistribution
      }
    });
  } catch (error) {
    console.error('❌ Get statistics error:', error);
    next(error);
  }
};
