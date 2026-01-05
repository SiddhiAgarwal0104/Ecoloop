const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const UserStats = require('../models/UserStats');
const Notification = require('../models/HouseholdNotification');
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

    // Get all user badges with badge details
    const userBadges = await UserBadge.find({ userId })
      .populate('badgeId')
      .sort({ earnedAt: -1 });

    // Separate earned and in-progress
    const earned = userBadges.filter(ub => ub.isCompleted && ub.badgeId);
    const inProgress = userBadges.filter(ub => !ub.isCompleted && ub.badgeId);

    // Get all available badges
    const allBadges = await Badge.find({ isActive: true });

    // Find locked badges (not started)
    const userBadgeIds = userBadges
      .filter(ub => ub.badgeId)
      .map(ub => ub.badgeId._id.toString());
    
    const locked = allBadges.filter(
      badge => !userBadgeIds.includes(badge._id.toString())
    );

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
    console.error('Error in getMyBadges:', error);
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
      // Check if user already has this badge completed
      const existingBadge = await UserBadge.findOne({ 
        userId, 
        badgeId: badge._id 
      });

      // Skip if already earned
      if (existingBadge && existingBadge.isCompleted) {
        continue;
      }

      let currentProgress = 0;
      let shouldAward = false;

      // Calculate progress based on badge requirement
      switch (badge.requirement.action) {
        case 'DONATION':
          // Use completed donations only
          currentProgress = userStats.donations.completed;
          break;
        case 'RECYCLE':
          // Use completed recycles only
          currentProgress = userStats.recycles.completed;
          break;
        case 'CONSECUTIVE_DAYS':
          currentProgress = userStats.streak.current;
          break;
        case 'TOTAL_IMPACT':
          currentProgress = userStats.impactScore;
          break;
        case 'TOTAL_ACTIONS':
          // Total completed actions (donations + recycles)
          currentProgress = userStats.donations.completed + userStats.recycles.completed;
          break;
        default:
          console.log(`⚠️ Unknown badge action type: ${badge.requirement.action}`);
          currentProgress = 0;
      }

      // Check if badge should be awarded
      shouldAward = currentProgress >= badge.requirement.value;

      if (existingBadge) {
        // Update progress only
        if (!existingBadge.isCompleted) {
          existingBadge.progress.current = currentProgress;

          // Award badge if requirement met
          if (shouldAward) {
            existingBadge.isCompleted = true;
            existingBadge.earnedAt = new Date();

            // Update user stats
            userStats.badgesEarned += 1;
            userStats.totalPoints += badge.points;
            await userStats.save();

            newlyEarnedBadges.push(badge);
            console.log(`✅ Badge earned: ${badge.name} (Progress: ${currentProgress}/${badge.requirement.value})`);

            // Create notification
            await Notification.create({
              userId,
              type: 'SYSTEM',
              title: '🎉 New Badge Earned!',
              message: `Congratulations! You've earned the "${badge.name}" badge! +${badge.points} points`
            });
          }

          await existingBadge.save();
        }
      } else {
        // Create new badge progress tracking
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
          console.log(`✅ Badge earned: ${badge.name} (Progress: ${currentProgress}/${badge.requirement.value})`);

          await Notification.create({
            userId,
            type: 'SYSTEM',
            title: '🎉 New Badge Earned!',
            message: `Congratulations! You've earned the "${badge.name}" badge! +${badge.points} points`
          });
        } else {
          console.log(`📊 Badge progress tracked: ${badge.name} (${currentProgress}/${badge.requirement.value})`);
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