const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const UserStats = require('../models/UserStats');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');

// @desc    Get all available badges
// @route   GET /api/badges
// @access  Private
exports.getAllBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find({ isActive: true }).sort({ tier: 1, points: 1 });
    
    res.status(200).json({
      success: true,
      count: badges.length,
      data: badges
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's badges (earned and in-progress)
// @route   GET /api/badges/my
// @access  Private
exports.getMyBadges = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`📬 Fetching badges for user: ${userId}`);

    // Get all user badges with badge details
    const userBadges = await UserBadge.find({ userId })
      .populate('badgeId')
      .sort({ earnedAt: -1 });

    console.log(`✅ Found ${userBadges.length} user badges`);

    // Filter out null badgeId entries (deleted badges)
    const validUserBadges = userBadges.filter(ub => {
      if (!ub.badgeId) {
        console.warn(`⚠️ Skipping badge record with null badgeId: ${ub._id}`);
        return false;
      }
      return true;
    });

    console.log(`   - Valid badges: ${validUserBadges.length}`);

    // Separate earned and in-progress
    const earned = validUserBadges.filter(ub => ub.isCompleted);
    const inProgress = validUserBadges.filter(ub => !ub.isCompleted);

    console.log(`   - Earned: ${earned.length}`);
    console.log(`   - In Progress: ${inProgress.length}`);

    // Get all available badges
    const allBadges = await Badge.find({ isActive: true });
    console.log(`   - Total Available: ${allBadges.length}`);

    // Find locked badges (not started)
    const userBadgeIds = validUserBadges.map(ub => ub.badgeId._id.toString());
    const locked = allBadges.filter(
      badge => !userBadgeIds.includes(badge._id.toString())
    );

    console.log(`   - Locked: ${locked.length}`);

    res.status(200).json({
      success: true,
      data: {
        earned: earned.map(ub => ({
          ...ub.badgeId.toObject(),
          earnedAt: ub.earnedAt,
          userBadgeId: ub._id
        })),
        inProgress: inProgress.map(ub => ({
          ...ub.badgeId.toObject(),
          progress: ub.progress,
          userBadgeId: ub._id
        })),
        locked: locked,
        stats: {
          totalEarned: earned.length,
          totalAvailable: allBadges.length,
          completionRate: allBadges.length > 0 
            ? Math.round((earned.length / allBadges.length) * 100) 
            : 0
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching badges:', error);
    next(error);
  }
};

// @desc    Check and award badges after user action
// @route   POST /api/badges/check
// @access  Private (called internally)
exports.checkAndAwardBadges = async (userId, actionType, actionData = {}) => {
  try {
    console.log(`🎖️ Checking badges for user ${userId}, action: ${actionType}`);

    // Get user stats
    const userStats = await UserStats.findOne({ userId });
    if (!userStats) {
      console.log('⚠️ User stats not found');
      return;
    }

    // Get all active badges
    const badges = await Badge.find({ isActive: true });
    const newlyEarnedBadges = [];

    for (const badge of badges) {
      // Check if user already has this badge
      const existingBadge = await UserBadge.findOne({ 
        userId, 
        badgeId: badge._id 
      });

      let currentProgress = 0;
      let shouldAward = false;

      // Calculate progress based on badge requirement
      switch (badge.requirement.action) {
        case 'DONATION':
          currentProgress = userStats.donations.completed;
          break;
        case 'RECYCLE':
          currentProgress = userStats.recycles.completed;
          break;
        case 'CONSECUTIVE_DAYS':
          currentProgress = userStats.streak.current;
          break;
        case 'TOTAL_IMPACT':
          currentProgress = userStats.impactScore;
          break;
        default:
          currentProgress = 0;
      }

      shouldAward = currentProgress >= badge.requirement.value;

      if (existingBadge) {
        // Update progress if not completed
        if (!existingBadge.isCompleted && shouldAward) {
          existingBadge.isCompleted = true;
          existingBadge.earnedAt = new Date();
          existingBadge.progress.current = currentProgress;
          await existingBadge.save();

          // Update user stats
          userStats.badgesEarned += 1;
          userStats.totalPoints += badge.points;
          await userStats.save();

          newlyEarnedBadges.push(badge);
          console.log(`✅ Badge earned: ${badge.name}`);

          // Create notification
          await Notification.create({
            userId,
            type: 'SYSTEM',
            title: '🎉 New Badge Earned!',
            message: `Congratulations! You've earned the "${badge.name}" badge! +${badge.points} points`
          });
        } else if (!existingBadge.isCompleted) {
          // Update progress
          existingBadge.progress.current = currentProgress;
          await existingBadge.save();
        }
      } else {
        // Create new badge progress
        const userBadge = await UserBadge.create({
          userId,
          badgeId: badge._id,
          progress: {
            current: currentProgress,
            target: badge.requirement.value
          },
          isCompleted: shouldAward,
          earnedAt: shouldAward ? new Date() : undefined
        });

        if (shouldAward) {
          userStats.badgesEarned += 1;
          userStats.totalPoints += badge.points;
          await userStats.save();

          newlyEarnedBadges.push(badge);
          console.log(`✅ Badge earned: ${badge.name}`);

          await Notification.create({
            userId,
            type: 'SYSTEM',
            title: '🎉 New Badge Earned!',
            message: `Congratulations! You've earned the "${badge.name}" badge! +${badge.points} points`
          });
        }
      }
    }

    // Check for level up
    await checkLevelUp(userId, userStats);

    return newlyEarnedBadges;
  } catch (error) {
    console.error('❌ Error checking badges:', error);
  }
};

// Helper function to check level up
const checkLevelUp = async (userId, userStats) => {
  const pointsForNextLevel = userStats.level * 100;
  
  if (userStats.totalPoints >= pointsForNextLevel) {
    const newLevel = Math.floor(userStats.totalPoints / 100) + 1;
    
    if (newLevel > userStats.level) {
      userStats.level = newLevel;
      await userStats.save();

      await Notification.create({
        userId,
        type: 'SYSTEM',
        title: '🎊 Level Up!',
        message: `Amazing! You've reached Level ${newLevel}! Keep up the great work!`
      });

      console.log(`🎊 User leveled up to Level ${newLevel}`);
    }
  }
};

// @desc    Get badge details
// @route   GET /api/badges/:id
// @access  Private
exports.getBadgeById = async (req, res, next) => {
  try {
    const badge = await Badge.findById(req.params.id);

    if (!badge) {
      return next(new AppError('Badge not found', 404));
    }

    // Check if user has this badge
    const userBadge = await UserBadge.findOne({
      userId: req.user.id,
      badgeId: badge._id
    });

    res.status(200).json({
      success: true,
      data: {
        ...badge.toObject(),
        userProgress: userBadge ? {
          current: userBadge.progress.current,
          target: userBadge.progress.target,
          isCompleted: userBadge.isCompleted,
          earnedAt: userBadge.earnedAt
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;