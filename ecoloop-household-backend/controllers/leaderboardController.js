const UserStats = require('../models/UserStats');
const User = require('../models/User');
const AppError = require('../utils/appError');

// @desc    Get global leaderboard
// @route   GET /api/leaderboard/global
// @access  Private
exports.getGlobalLeaderboard = async (req, res, next) => {
  try {
    const { limit = 50, sortBy = 'totalPoints' } = req.query;

    const validSortFields = ['totalPoints', 'impactScore', 'level', 'badgesEarned'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'totalPoints';

    const leaderboard = await UserStats.find()
      .populate('userId', 'name locality profilePicture')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));

    // Find current user's rank
    const currentUserStats = await UserStats.findOne({ userId: req.user.id });
    let currentUserRank = null;

    if (currentUserStats) {
      const rankPosition = await UserStats.countDocuments({
        [sortField]: { $gt: currentUserStats[sortField] }
      });
      currentUserRank = rankPosition + 1;
    }

    const formattedLeaderboard = leaderboard.map((stat, index) => ({
      rank: index + 1,
      userId: stat.userId._id,
      name: stat.userId.name,
      locality: stat.userId.locality,
      profilePicture: stat.userId.profilePicture,
      totalPoints: stat.totalPoints,
      level: stat.level,
      impactScore: stat.impactScore,
      badgesEarned: stat.badgesEarned,
      donations: stat.donations.completed,
      recycles: stat.recycles.completed,
      streak: stat.streak.current,
      isCurrentUser: stat.userId._id.toString() === req.user.id
    }));

    res.status(200).json({
      success: true,
      data: {
        leaderboard: formattedLeaderboard,
        currentUser: currentUserRank ? {
          rank: currentUserRank,
          stats: currentUserStats
        } : null,
        sortedBy: sortField
      }
    });
  } catch (error) {
    console.error('❌ Error fetching global leaderboard:', error);
    next(error);
  }
};

// @desc    Get locality-based leaderboard
// @route   GET /api/leaderboard/locality
// @access  Private
exports.getLocalityLeaderboard = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const userLocality = req.user.locality;

    if (!userLocality || userLocality === 'Not Set') {
      return next(new AppError('Please set your locality to view local leaderboard', 400));
    }

    // Find all users in the same locality
    const localUsers = await User.find({ locality: userLocality }).select('_id');
    const localUserIds = localUsers.map(u => u._id);

    const leaderboard = await UserStats.find({ userId: { $in: localUserIds } })
      .populate('userId', 'name locality profilePicture')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit));

    // Find current user's local rank
    const currentUserStats = await UserStats.findOne({ userId: req.user.id });
    let currentUserRank = null;

    if (currentUserStats) {
      const rankPosition = await UserStats.countDocuments({
        userId: { $in: localUserIds },
        totalPoints: { $gt: currentUserStats.totalPoints }
      });
      currentUserRank = rankPosition + 1;
    }

    const formattedLeaderboard = leaderboard.map((stat, index) => ({
      rank: index + 1,
      userId: stat.userId._id,
      name: stat.userId.name,
      locality: stat.userId.locality,
      profilePicture: stat.userId.profilePicture,
      totalPoints: stat.totalPoints,
      level: stat.level,
      impactScore: stat.impactScore,
      badgesEarned: stat.badgesEarned,
      donations: stat.donations.completed,
      recycles: stat.recycles.completed,
      streak: stat.streak.current,
      isCurrentUser: stat.userId._id.toString() === req.user.id
    }));

    res.status(200).json({
      success: true,
      data: {
        leaderboard: formattedLeaderboard,
        locality: userLocality,
        currentUser: currentUserRank ? {
          rank: currentUserRank,
          stats: currentUserStats
        } : null
      }
    });
  } catch (error) {
    console.error('❌ Error fetching locality leaderboard:', error);
    next(error);
  }
};

// @desc    Get user's stats and position
// @route   GET /api/leaderboard/my-stats
// @access  Private
exports.getMyStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let userStats = await UserStats.findOne({ userId });

    // Create stats if doesn't exist
    if (!userStats) {
      userStats = await UserStats.create({ userId });
    }

    // Get global rank
    const globalRank = await UserStats.countDocuments({
      totalPoints: { $gt: userStats.totalPoints }
    }) + 1;

    // Get locality rank if locality is set
    let localityRank = null;
    if (req.user.locality && req.user.locality !== 'Not Set') {
      const localUsers = await User.find({ locality: req.user.locality }).select('_id');
      const localUserIds = localUsers.map(u => u._id);

      localityRank = await UserStats.countDocuments({
        userId: { $in: localUserIds },
        totalPoints: { $gt: userStats.totalPoints }
      }) + 1;
    }

    // Calculate points needed for next level
    const pointsForNextLevel = userStats.level * 100;
    const pointsToNextLevel = pointsForNextLevel - userStats.totalPoints;

    res.status(200).json({
      success: true,
      data: {
        stats: userStats,
        rankings: {
          global: globalRank,
          locality: localityRank
        },
        levelProgress: {
          currentLevel: userStats.level,
          currentPoints: userStats.totalPoints,
          pointsForNextLevel,
          pointsToNextLevel: Math.max(0, pointsToNextLevel),
          progressPercentage: Math.min(100, Math.round((userStats.totalPoints / pointsForNextLevel) * 100))
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    next(error);
  }
};

module.exports = exports;