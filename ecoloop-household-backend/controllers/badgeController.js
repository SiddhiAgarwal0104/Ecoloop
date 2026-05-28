const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const UserStats = require('../models/UserStats');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');

exports.getAllBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find({ isActive: true }).sort({ tier: 1, points: 1 });
    res.status(200).json({ success: true, count: badges.length, data: badges });
  } catch (error) {
    next(error);
  }
};

exports.getMyBadges = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userBadges = await UserBadge.find({ userId }).populate('badgeId').sort({ earnedAt: -1 });
    const validUserBadges = userBadges.filter(ub => ub.badgeId);

    const earned = validUserBadges.filter(ub => ub.isCompleted);
    const inProgress = validUserBadges.filter(ub => !ub.isCompleted);
    const allBadges = await Badge.find({ isActive: true });

    const userBadgeIds = validUserBadges.map(ub => ub.badgeId._id.toString());
    const locked = allBadges.filter(badge => !userBadgeIds.includes(badge._id.toString()));

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
        locked,
        stats: {
          totalEarned: earned.length,
          totalAvailable: allBadges.length,
          completionRate: allBadges.length > 0
            ? Math.round((earned.length / allBadges.length) * 100) : 0
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching badges:', error);
    next(error);
  }
};

exports.checkAndAwardBadges = async (userId, actionType, actionData = {}) => {
  try {
    console.log(`🎖️ Checking badges for user ${userId}, action: ${actionType}`);

    const userStats = await UserStats.findOne({ userId });
    if (!userStats) { console.log('⚠️ User stats not found'); return; }

    const badges = await Badge.find({ isActive: true });
    const newlyEarnedBadges = [];

    for (const badge of badges) {
      const existingBadge = await UserBadge.findOne({ userId, badgeId: badge._id });

      let currentProgress = 0;

      // ✅ FIXED: Correct progress calculation
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
          // Total completed actions (donations + recycles)
          currentProgress = userStats.donations.completed + userStats.recycles.completed;
          break;
        default:
          currentProgress = 0;
      }

      const shouldAward = currentProgress >= badge.requirement.value;

      if (existingBadge) {
        if (!existingBadge.isCompleted && shouldAward) {
          existingBadge.isCompleted = true;
          existingBadge.earnedAt = new Date();
          existingBadge.progress.current = currentProgress;
          await existingBadge.save();

          userStats.badgesEarned += 1;
          userStats.totalPoints += badge.points;
          await userStats.save();

          newlyEarnedBadges.push(badge);
          console.log(`✅ Badge earned: ${badge.name}`);

          await Notification.create({
            userId, type: 'SYSTEM',
            title: '🎉 New Badge Earned!',
            message: `You've earned the "${badge.name}" badge! +${badge.points} points`
          });
        } else if (!existingBadge.isCompleted) {
          existingBadge.progress.current = currentProgress;
          await existingBadge.save();
        }
      } else {
        await UserBadge.create({
          userId, badgeId: badge._id,
          progress: { current: currentProgress, target: badge.requirement.value },
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
            userId, type: 'SYSTEM',
            title: '🎉 New Badge Earned!',
            message: `You've earned the "${badge.name}" badge! +${badge.points} points`
          });
        }
      }
    }

    await checkLevelUp(userId, userStats);
    return newlyEarnedBadges;
  } catch (error) {
    console.error('❌ Error checking badges:', error);
  }
};

const checkLevelUp = async (userId, userStats) => {
  const pointsForNextLevel = userStats.level * 100;
  if (userStats.totalPoints >= pointsForNextLevel) {
    const newLevel = Math.floor(userStats.totalPoints / 100) + 1;
    if (newLevel > userStats.level) {
      userStats.level = newLevel;
      await userStats.save();
      await Notification.create({
        userId, type: 'SYSTEM',
        title: '🎊 Level Up!',
        message: `You've reached Level ${newLevel}! Keep it up!`
      });
      console.log(`🎊 Level up: ${newLevel}`);
    }
  }
};

exports.getBadgeById = async (req, res, next) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) return next(new AppError('Badge not found', 404));

    const userBadge = await UserBadge.findOne({ userId: req.user.id, badgeId: badge._id });

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
  } catch (error) { next(error); }
};

module.exports = exports;
