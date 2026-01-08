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

    // FIXED: First get all HOUSEHOLD user IDs
    const householdUsers = await User.find({ role: 'HOUSEHOLD' }).select('_id');
    const householdUserIds = householdUsers.map(u => u._id);

    console.log('👥 Total HOUSEHOLD users found:', householdUserIds.length);

    // FIXED: Query only HOUSEHOLD users with points > 0, then sort and limit
    const leaderboard = await UserStats.find({
      userId: { $in: householdUserIds },
      totalPoints: { $gt: 0 }
    })
      .populate('userId', 'name locality profilePicture role')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));

    console.log('🏆 Leaderboard entries returned:', leaderboard.length);

    // Find current user's rank (only if user is HOUSEHOLD)
    let currentUserRank = null;
    let currentUserStats = null;

    if (req.user.role === 'HOUSEHOLD') {
      currentUserStats = await UserStats.findOne({ userId: req.user.id });
      
      if (currentUserStats && currentUserStats.totalPoints > 0) {
        // Count how many HOUSEHOLD users have higher points
        const rankPosition = await UserStats.countDocuments({
          userId: { $in: householdUserIds },
          [sortField]: { $gt: currentUserStats[sortField] }
        });
        currentUserRank = rankPosition + 1;
      }
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
        sortedBy: sortField,
        totalHouseholdUsers: householdUserIds.length,
        usersWithPoints: leaderboard.length
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

    console.log('📍 Current user ID:', req.user._id);
    console.log('📍 Current user locality:', userLocality);
    console.log('📍 Current user role:', req.user.role);

    // Validate locality
    if (!userLocality || userLocality === 'Not Set' || userLocality.trim() === '') {
      console.error('❌ User locality not set:', userLocality);
      return res.status(400).json({
        success: false,
        error: 'Please set your locality in your profile to view local leaderboard',
        message: 'Locality not set - update your profile'
      });
    }

    // Normalize locality for comparison
    const normalizedLocality = userLocality.trim().toLowerCase();
    console.log('🔍 Searching for HOUSEHOLD users in locality:', normalizedLocality);

    // FIXED: Find all HOUSEHOLD users in the same locality
    const localUsers = await User.find({
      locality: {
        $regex: `^${normalizedLocality}$`,
        $options: 'i'
      },
      role: 'HOUSEHOLD'
    }).select('_id locality name role');

    console.log('👥 Found HOUSEHOLD users in locality:', localUsers.length);
    
    if (localUsers.length === 0) {
      console.warn('⚠️ No HOUSEHOLD users found in locality:', normalizedLocality);
      return res.status(200).json({
        success: true,
        data: {
          leaderboard: [],
          locality: userLocality,
          totalUsersInLocality: 0,
          currentUser: null,
          message: 'No users found in your locality yet'
        }
      });
    }

    const localUserIds = localUsers.map(u => u._id);

    // FIXED: Get stats for local HOUSEHOLD users with points > 0
    const leaderboard = await UserStats.find({
      userId: { $in: localUserIds },
      totalPoints: { $gt: 0 }
    })
      .populate('userId', 'name locality profilePicture role')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit));

    console.log('🏆 Leaderboard entries with points:', leaderboard.length);

    // Find current user's local rank
    const userId = req.user._id || req.user.id;
    const currentUserStats = await UserStats.findOne({ userId: userId });
    let currentUserRank = null;

    if (currentUserStats && currentUserStats.totalPoints > 0) {
      // Count users in same locality with higher points
      const rankPosition = await UserStats.countDocuments({
        userId: { $in: localUserIds },
        totalPoints: { $gt: currentUserStats.totalPoints }
      });
      currentUserRank = rankPosition + 1;
      console.log('📊 Current user rank:', currentUserRank);
    } else if (currentUserStats) {
      // User has stats but 0 points - rank after all users with points
      const usersWithPoints = await UserStats.countDocuments({
        userId: { $in: localUserIds },
        totalPoints: { $gt: 0 }
      });
      currentUserRank = usersWithPoints + 1;
      console.log('📊 Current user rank (0 points):', currentUserRank);
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
      donations: stat.donations?.completed || 0,
      recycles: stat.recycles?.completed || 0,
      streak: stat.streak?.current || 0,
      isCurrentUser: stat.userId._id.toString() === userId.toString()
    }));

    res.status(200).json({
      success: true,
      data: {
        leaderboard: formattedLeaderboard,
        locality: userLocality,
        totalUsersInLocality: localUserIds.length,
        usersWithPoints: leaderboard.length,
        currentUser: currentUserRank && currentUserStats ? {
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

    // FIXED: Get global rank only among HOUSEHOLD users with points > 0
    let globalRank = null;
    if (req.user.role === 'HOUSEHOLD' && userStats.totalPoints > 0) {
      const householdUsers = await User.find({ role: 'HOUSEHOLD' }).select('_id');
      const householdUserIds = householdUsers.map(u => u._id);

      globalRank = await UserStats.countDocuments({
        userId: { $in: householdUserIds },
        totalPoints: { $gt: userStats.totalPoints }
      }) + 1;
    }

    // FIXED: Get locality rank only if user is HOUSEHOLD and locality is set
    let localityRank = null;
    if (req.user.role === 'HOUSEHOLD' && 
        req.user.locality && 
        req.user.locality !== 'Not Set' && 
        req.user.locality.trim() !== '') {
      
      const normalizedLocality = req.user.locality.trim().toLowerCase();
      
      const localUsers = await User.find({
        locality: {
          $regex: `^${normalizedLocality}$`,
          $options: 'i'
        },
        role: 'HOUSEHOLD'
      }).select('_id');
      
      const localUserIds = localUsers.map(u => u._id);

      if (userStats.totalPoints > 0) {
        localityRank = await UserStats.countDocuments({
          userId: { $in: localUserIds },
          totalPoints: { $gt: userStats.totalPoints }
        }) + 1;
      } else {
        // User has 0 points - rank after all users with points
        const usersWithPoints = await UserStats.countDocuments({
          userId: { $in: localUserIds },
          totalPoints: { $gt: 0 }
        });
        localityRank = usersWithPoints + 1;
      }
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