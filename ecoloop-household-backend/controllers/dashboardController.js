// const Donation = require('../models/Donation');
// const Recycle = require('../models/Recycle');
// const AppError = require('../utils/appError');

// // @desc    Get household dashboard data
// // @route   GET /api/dashboard/household
// // @access  Private (Household only)
// exports.getHouseholdDashboard = async (req, res, next) => {
//   try {
//     const userId = req.user.id;

//     // Fetch donations
//     const donations = await Donation.find({ userId })
//       .populate('assignedNGO', 'name email phone')
//       .sort({ createdAt: -1 })
//       .limit(10);

//     // Fetch recycle requests
//     const recycles = await Recycle.find({ userId })
//       .populate('assignedRecycler', 'name email phone')
//       .sort({ createdAt: -1 })
//       .limit(10);

//     // Calculate statistics
//     const totalDonations = await Donation.countDocuments({ userId });
//     const totalRecycles = await Recycle.countDocuments({ userId });
    
//     const activeDonations = await Donation.countDocuments({ 
//       userId, 
//       status: { $in: ['AVAILABLE', 'ACCEPTED', 'PICKED_UP'] } 
//     });
    
//     const activeRecycles = await Recycle.countDocuments({ 
//       userId, 
//       status: { $in: ['AVAILABLE', 'ACCEPTED', 'PICKED_UP'] } 
//     });

//     const completedDonations = await Donation.countDocuments({ 
//       userId, 
//       status: 'COMPLETED' 
//     });
    
//     const completedRecycles = await Recycle.countDocuments({ 
//       userId, 
//       status: 'RECYCLED' 
//     });

//     // Status breakdown for donations
//     const donationsByStatus = await Donation.aggregate([
//       { $match: { userId: req.user._id } },
//       { $group: { _id: '$status', count: { $sum: 1 } } }
//     ]);

//     // Status breakdown for recycles
//     const recyclesByStatus = await Recycle.aggregate([
//       { $match: { userId: req.user._id } },
//       { $group: { _id: '$status', count: { $sum: 1 } } }
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         donations: donations,
//         recycles: recycles,
//         stats: {
//           totalDonations,
//           totalRecycles,
//           activeDonations,
//           activeRecycles,
//           completedDonations,
//           completedRecycles,
//           donationsByStatus,
//           recyclesByStatus
//         },
//         quickActions: {
//           donate: true,
//           recycle: true,
//           communityShare: true
//         }
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Get household statistics only
// // @route   GET /api/dashboard/stats
// // @access  Private (Household only)
// exports.getHouseholdStats = async (req, res, next) => {
//   try {
//     const userId = req.user.id;

//     const stats = {
//       donations: {
//         total: await Donation.countDocuments({ userId }),
//         available: await Donation.countDocuments({ userId, status: 'AVAILABLE' }),
//         accepted: await Donation.countDocuments({ userId, status: 'ACCEPTED' }),
//         pickedUp: await Donation.countDocuments({ userId, status: 'PICKED_UP' }),
//         completed: await Donation.countDocuments({ userId, status: 'COMPLETED' })
//       },
//       recycles: {
//         total: await Recycle.countDocuments({ userId }),
//         available: await Recycle.countDocuments({ userId, status: 'AVAILABLE' }),
//         accepted: await Recycle.countDocuments({ userId, status: 'ACCEPTED' }),
//         pickedUp: await Recycle.countDocuments({ userId, status: 'PICKED_UP' }),
//         recycled: await Recycle.countDocuments({ userId, status: 'RECYCLED' })
//       }
//     };

//     res.status(200).json({
//       success: true,
//       data: { stats }
//     });
//   } catch (error) {
//     next(error);
//   }

// };


const Donation = require('../models/Donation');
const Recycle = require('../models/Recycle');
const UserStats = require('../models/UserStats');
const AppError = require('../utils/appError');

// @desc    Get dashboard data based on user role
// @route   GET /api/dashboard
// @access  Private (All roles)
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let dashboardData = {};

    switch (userRole) {
      case 'HOUSEHOLD':
        dashboardData = await getHouseholdDashboard(userId, req.user);
        break;
      case 'NGO':
        dashboardData = await getNGODashboard(userId, req.user);
        break;
      case 'RECYCLER':
        dashboardData = await getRecyclerDashboard(userId, req.user);
        break;
      default:
        return next(new AppError('Invalid user role', 400));
    }

    res.status(200).json({
      success: true,
      role: userRole,
      data: dashboardData
    });
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    next(error);
  }
};

// ================= HOUSEHOLD DASHBOARD =================
const getHouseholdDashboard = async (userId, user) => {
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

  // Get user stats for gamification
  let userStats = await UserStats.findOne({ userId });
  if (!userStats) {
    userStats = await UserStats.create({ userId });
  }

  return {
    profile: {
      name: user.name,
      email: user.email,
      locality: user.locality,
      profilePicture: user.profilePicture
    },
    donations: donations,
    recycles: recycles,
    stats: {
      totalDonations,
      totalRecycles,
      activeDonations,
      activeRecycles,
      completedDonations,
      completedRecycles,
      totalPoints: userStats.totalPoints,
      level: userStats.level,
      streak: userStats.streak.current
    },
    quickActions: {
      donate: true,
      recycle: true,
      viewLeaderboard: true
    }
  };
};

// ================= NGO DASHBOARD =================
const getNGODashboard = async (userId, user) => {
  // Check if NGO has location set
  if (!user.location?.latitude || !user.location?.longitude) {
    return {
      profile: {
        name: user.name,
        email: user.email,
        locality: user.locality,
        profilePicture: user.profilePicture
      },
      needsLocation: true,
      message: 'Please set your NGO location to view available donations',
      stats: {
        acceptedDonations: 0,
        pickedUpDonations: 0,
        completedDonations: 0
      }
    };
  }

  // Fetch accepted donations
  const acceptedDonations = await Donation.find({ assignedNGO: userId })
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(10);

  // Calculate statistics
  const totalAccepted = await Donation.countDocuments({ assignedNGO: userId });
  const pickedUp = await Donation.countDocuments({ 
    assignedNGO: userId, 
    status: 'PICKED_UP' 
  });
  const completed = await Donation.countDocuments({ 
    assignedNGO: userId, 
    status: 'COMPLETED' 
  });

  // Get available donations count (within radius)
  const availableDonations = await Donation.countDocuments({ 
    status: 'AVAILABLE',
    assignedNGO: null
  });

  return {
    profile: {
      name: user.name,
      email: user.email,
      locality: user.locality,
      profilePicture: user.profilePicture,
      location: user.location
    },
    acceptedDonations: acceptedDonations,
    stats: {
      totalAccepted,
      pickedUp,
      completed,
      completionRate: totalAccepted > 0 ? Math.round((completed / totalAccepted) * 100) : 0,
      availableDonations
    },
    quickActions: {
      viewAvailableDonations: true,
      viewMyDonations: true
    }
  };
};

// ================= RECYCLER DASHBOARD =================
const getRecyclerDashboard = async (userId, user) => {
  // Check if recycler has location set
  if (!user.location?.latitude || !user.location?.longitude) {
    return {
      profile: {
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      },
      needsLocation: true,
      message: 'Please set your location to view available recycle requests',
      stats: {
        totalAccepted: 0,
        pickedUp: 0,
        recycled: 0
      }
    };
  }

  // Fetch accepted recycle requests
  const acceptedRequests = await Recycle.find({ assignedRecycler: userId })
    .populate('userId', 'name phone address')
    .sort({ createdAt: -1 })
    .limit(10);

  // Calculate statistics
  const totalAccepted = await Recycle.countDocuments({ assignedRecycler: userId });
  const pickedUp = await Recycle.countDocuments({ 
    assignedRecycler: userId, 
    status: 'PICKED_UP' 
  });
  const recycled = await Recycle.countDocuments({ 
    assignedRecycler: userId, 
    status: 'RECYCLED' 
  });

  // Calculate total waste collected
  const wasteCollectedAgg = await Recycle.aggregate([
    { $match: { assignedRecycler: userId, status: 'RECYCLED' } },
    { $group: { _id: null, total: { $sum: '$quantity' } } }
  ]);
  const totalWasteCollected = wasteCollectedAgg.length > 0 ? wasteCollectedAgg[0].total : 0;

  // Get waste by category
  const wasteByCategory = await Recycle.aggregate([
    { $match: { assignedRecycler: userId, status: 'RECYCLED' } },
    { $group: { _id: '$wasteCategory', quantity: { $sum: '$quantity' } } },
    { $project: { _id: 0, category: '$_id', quantity: 1 } }
  ]);

  // Get available requests count
  const availableRequests = await Recycle.countDocuments({ 
    status: 'AVAILABLE',
    assignedRecycler: null 
  });

  return {
    profile: {
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      location: user.location
    },
    acceptedRequests: acceptedRequests,
    stats: {
      totalAccepted,
      pickedUp,
      recycled,
      completionRate: totalAccepted > 0 ? Math.round((recycled / totalAccepted) * 100) : 0,
      totalWasteCollected: Math.round(totalWasteCollected * 10) / 10,
      availableRequests
    },
    wasteByCategory: wasteByCategory,
    quickActions: {
      viewAvailableRequests: true,
      viewMyRequests: true
    }
  };
};

// @desc    Get statistics summary (for all roles)
// @route   GET /api/dashboard/stats
// @access  Private (All roles)
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'HOUSEHOLD') {
      stats = {
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
    } else if (userRole === 'NGO') {
      stats = {
        donations: {
          total: await Donation.countDocuments({ assignedNGO: userId }),
          accepted: await Donation.countDocuments({ assignedNGO: userId, status: 'ACCEPTED' }),
          pickedUp: await Donation.countDocuments({ assignedNGO: userId, status: 'PICKED_UP' }),
          completed: await Donation.countDocuments({ assignedNGO: userId, status: 'COMPLETED' })
        }
      };
    } else if (userRole === 'RECYCLER') {
      stats = {
        recycles: {
          total: await Recycle.countDocuments({ assignedRecycler: userId }),
          accepted: await Recycle.countDocuments({ assignedRecycler: userId, status: 'ACCEPTED' }),
          pickedUp: await Recycle.countDocuments({ assignedRecycler: userId, status: 'PICKED_UP' }),
          recycled: await Recycle.countDocuments({ assignedRecycler: userId, status: 'RECYCLED' })
        }
      };
    }

    res.status(200).json({
      success: true,
      role: userRole,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;