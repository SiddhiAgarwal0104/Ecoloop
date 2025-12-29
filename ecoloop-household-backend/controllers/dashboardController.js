const Donation = require('../models/Donation');
const Recycle = require('../models/Recycle');
const AppError = require('../utils/appError');

// @desc    Get household dashboard data
// @route   GET /api/dashboard/household
// @access  Private (Household only)
exports.getHouseholdDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch donations
    const donations = await Donation.find({ userId })
      .populate('assignedNGO', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10);

    // Fetch recycle requests
    const recycles = await Recycle.find({ userId })
      .populate('assignedRecycler', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate statistics
    const totalDonations = await Donation.countDocuments({ userId });
    const totalRecycles = await Recycle.countDocuments({ userId });
    
    const activeDonations = await Donation.countDocuments({ 
      userId, 
      status: { $in: ['AVAILABLE', 'ACCEPTED', 'PICKED_UP'] } 
    });
    
    const activeRecycles = await Recycle.countDocuments({ 
      userId, 
      status: { $in: ['AVAILABLE', 'ACCEPTED', 'PICKED_UP'] } 
    });

    const completedDonations = await Donation.countDocuments({ 
      userId, 
      status: 'COMPLETED' 
    });
    
    const completedRecycles = await Recycle.countDocuments({ 
      userId, 
      status: 'RECYCLED' 
    });

    // Status breakdown for donations
    const donationsByStatus = await Donation.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Status breakdown for recycles
    const recyclesByStatus = await Recycle.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        donations: donations,
        recycles: recycles,
        stats: {
          totalDonations,
          totalRecycles,
          activeDonations,
          activeRecycles,
          completedDonations,
          completedRecycles,
          donationsByStatus,
          recyclesByStatus
        },
        quickActions: {
          donate: true,
          recycle: true,
          communityShare: true
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get household statistics only
// @route   GET /api/dashboard/stats
// @access  Private (Household only)
exports.getHouseholdStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = {
      donations: {
        total: await Donation.countDocuments({ userId }),
        available: await Donation.countDocuments({ userId, status: 'AVAILABLE' }),
        accepted: await Donation.countDocuments({ userId, status: 'ACCEPTED' }),
        pickedUp: await Donation.countDocuments({ userId, status: 'PICKED_UP' }),
        completed: await Donation.countDocuments({ userId, status: 'COMPLETED' })
      },
      recycles: {
        total: await Recycle.countDocuments({ userId }),
        available: await Recycle.countDocuments({ userId, status: 'AVAILABLE' }),
        accepted: await Recycle.countDocuments({ userId, status: 'ACCEPTED' }),
        pickedUp: await Recycle.countDocuments({ userId, status: 'PICKED_UP' }),
        recycled: await Recycle.countDocuments({ userId, status: 'RECYCLED' })
      }
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};
