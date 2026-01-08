const UserStats = require('../models/UserStats');
const Donation = require('../models/Donation');
const Recycle = require('../models/Recycle');
const { checkAndAwardBadges } = require('./badgeController');

// Points configuration
const POINTS_CONFIG = {
  DONATION_CREATED: 10,
  DONATION_COMPLETED: 25,
  RECYCLE_CREATED: 10,
  RECYCLE_COMPLETED: 30,
  STREAK_BONUS: 5,
  FIRST_ACTION: 50
};

// @desc    Update user stats after donation/recycle action
// @route   Internal function
// @access  Private
exports.updateUserStats = async (userId, actionType, actionData = {}) => {
  try {
    console.log(`📊 Updating stats for user ${userId}, action: ${actionType}`);

    let userStats = await UserStats.findOne({ userId });

    // Create stats if doesn't exist
    if (!userStats) {
      userStats = await UserStats.create({ userId });
    }

    let pointsEarned = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check streak
    const lastActivity = userStats.streak.lastActivity;
    const lastActivityDate = lastActivity ? new Date(lastActivity) : null;
    
    if (lastActivityDate) {
      lastActivityDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day
        userStats.streak.current += 1;
        pointsEarned += POINTS_CONFIG.STREAK_BONUS;
        console.log(`🔥 Streak continued: ${userStats.streak.current} days`);
      } else if (daysDiff > 1) {
        // Streak broken
        if (userStats.streak.current > userStats.streak.longest) {
          userStats.streak.longest = userStats.streak.current;
        }
        userStats.streak.current = 1;
        console.log('💔 Streak reset');
      }
      // If daysDiff === 0, same day, don't change streak
    } else {
      // First activity ever
      userStats.streak.current = 1;
      pointsEarned += POINTS_CONFIG.FIRST_ACTION;
      console.log('🎉 First activity!');
    }

    userStats.streak.lastActivity = new Date();

    // Update longest streak
    if (userStats.streak.current > userStats.streak.longest) {
      userStats.streak.longest = userStats.streak.current;
    }

    // Handle different action types
    switch (actionType) {
      case 'DONATION_CREATED':
        userStats.donations.total += 1;
        userStats.donations.totalItems += actionData.quantity || 1;
        pointsEarned += POINTS_CONFIG.DONATION_CREATED;
        break;

      case 'DONATION_COMPLETED':
        userStats.donations.completed += 1;
        pointsEarned += POINTS_CONFIG.DONATION_COMPLETED;
        break;

      case 'RECYCLE_CREATED':
        userStats.recycles.total += 1;
        userStats.recycles.totalWeight += actionData.quantity || 0;
        pointsEarned += POINTS_CONFIG.RECYCLE_CREATED;
        break;

      case 'RECYCLE_COMPLETED':
        userStats.recycles.completed += 1;
        pointsEarned += POINTS_CONFIG.RECYCLE_COMPLETED;
        break;

      default:
        console.log('⚠️ Unknown action type:', actionType);
    }

    // Update total points and impact score
    userStats.totalPoints += pointsEarned;
    userStats.impactScore += Math.round(pointsEarned * 1.5);

    await userStats.save();

    console.log(`✅ Stats updated. Points earned: ${pointsEarned}`);

    // Check for badges
    await checkAndAwardBadges(userId, actionType, actionData);

    return {
      pointsEarned,
      totalPoints: userStats.totalPoints,
      level: userStats.level,
      streak: userStats.streak.current
    };
  } catch (error) {
    console.error('❌ Error updating user stats:', error);
    throw error;
  }
};

// @desc    Get rewards summary for user
// @route   GET /api/rewards/summary
// @access  Private
exports.getRewardsSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let userStats = await UserStats.findOne({ userId });

    if (!userStats) {
      userStats = await UserStats.create({ userId });
    }

    // Get recent activities
    const recentDonations = await Donation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('itemCategory quantity status createdAt');

    const recentRecycles = await Recycle.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('wasteCategory quantity status createdAt');

    res.status(200).json({
      success: true,
      data: {
        stats: userStats,
        recentActivities: {
          donations: recentDonations,
          recycles: recentRecycles
        },
        pointsConfig: POINTS_CONFIG
      }
    });
  } catch (error) {
    console.error('❌ Error fetching rewards summary:', error);
    next(error);
  }
};

module.exports = exports;