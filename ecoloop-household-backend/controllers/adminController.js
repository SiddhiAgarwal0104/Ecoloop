const User = require('../models/User');
const Admin = require('../models/Admin');
const Donation = require('../models/Donation');
const Recycle = require('../models/Recycle');
const AppError = require('../utils/appError');
const { generateToken } = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const { generateWeeklyReport, generateDonationReport, generateNGOPerformanceReport } = require('../services/reportService');

/**
 * Helper: Get admin's city from user
 */
const getAdminCity = async (userId) => {
  const user = await User.findById(userId).select('city');
  return user?.city;
};

/**
 * Admin Login
 */
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email, role: 'ADMIN' });

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    const admin = await Admin.findOne({ userId: user._id });

    if (!admin || !admin.isActive) {
      return next(new AppError('Admin account is not active', 403));
    }

    // Update last login
    admin.lastLogin = new Date();
    admin.loginAttempts = 0;
    await admin.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Admin logged in successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register Admin (SUPER_ADMIN only)
 */
exports.registerAdmin = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return next(new AppError('Please provide email, password, and name', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    const user = new User({
      email,
      password,
      name,
      role: 'ADMIN'
    });

    await user.save();

    const admin = new Admin({
      userId: user._id,
      role: 'ADMIN'
    });

    await admin.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete Admin Profile (after registration)
 */
exports.completeAdminProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { phone, city, locality, pincode, address } = req.body;

    // Validation
    if (!city || !locality || !pincode || !address) {
      return next(new AppError('Please provide city, locality, pincode, and address', 400));
    }

    // Verify pincode is 6 digits
    if (!/^\d{6}$/.test(pincode)) {
      return next(new AppError('Pincode must be exactly 6 digits', 400));
    }

    // Update user profile
    const user = await User.findByIdAndUpdate(
      userId,
      {
        phone: phone || undefined,
        city,
        locality,
        pincode,
        address,
        profileCompleted: true
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Admin profile completed successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        locality: user.locality,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Pending NGO Verification Requests
 */
exports.getPendingNGOs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Get admin's city
    const adminCity = await getAdminCity(req.user._id);
    if (!adminCity) {
      return next(new AppError('Admin profile incomplete. Please complete your profile first.', 400));
    }

    const searchRegex = new RegExp(search, 'i');

    const ngos = await User.find({
      role: 'NGO',
      isVerified: false,
      city: adminCity,
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { locality: searchRegex }
      ]
    })
      .select('name email phone locality city address isVerified verificationRequestedAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ verificationRequestedAt: -1 });

    const total = await User.countDocuments({
      role: 'NGO',
      isVerified: false,
      city: adminCity
    });

    res.status(200).json({
      success: true,
      data: ngos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Verified NGOs
 */
exports.getVerifiedNGOs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', locality = '' } = req.query;
    
    // Get admin's city
    const adminCity = await getAdminCity(req.user._id);
    if (!adminCity) {
      return next(new AppError('Admin profile incomplete. Please complete your profile first.', 400));
    }

    const searchRegex = new RegExp(search, 'i');
    const filter = {
      role: 'NGO',
      isVerified: true,
      city: adminCity
    };

    if (locality) {
      filter.locality = new RegExp(locality, 'i');
    }

    if (search) {
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { locality: searchRegex }
      ];
    }

    const ngos = await User.find(filter)
      .select('name email phone locality city averageRating totalRatings isVerified verificationApprovedAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ verificationApprovedAt: -1 });

    const total = await User.countDocuments(filter);

    // Count donations received
    const ngoStats = await Promise.all(
      ngos.map(async (ngo) => {
        const donationCount = await Donation.countDocuments({
          assignedNGO: ngo._id,
          status: 'COMPLETED'
        });
        return {
          ...ngo.toObject(),
          donationsReceived: donationCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: ngoStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve NGO Verification
 */
exports.approveNGO = async (req, res, next) => {
  try {
    const { ngoId } = req.params;

    const ngo = await User.findByIdAndUpdate(
      ngoId,
      {
        isVerified: true,
        verificationApprovedAt: new Date(),
        verificationApprovedBy: req.user._id,
        verificationRejectionReason: null
      },
      { new: true }
    ).select('name email locality isVerified');

    if (!ngo) {
      return next(new AppError('NGO not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'NGO verified successfully',
      data: ngo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject NGO Verification
 */
exports.rejectNGO = async (req, res, next) => {
  try {
    const { ngoId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return next(new AppError('Please provide rejection reason', 400));
    }

    const ngo = await User.findByIdAndUpdate(
      ngoId,
      {
        isVerified: false,
        verificationRejectionReason: reason,
        verificationApprovedAt: null,
        verificationApprovedBy: null
      },
      { new: true }
    ).select('name email locality isVerified verificationRejectionReason');

    if (!ngo) {
      return next(new AppError('NGO not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'NGO verification rejected',
      data: ngo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Donations Overview
 */
exports.getDonationsOverview = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = req.query;
    
    // Get admin's city
    const adminCity = await getAdminCity(req.user._id);
    if (!adminCity) {
      return next(new AppError('Admin profile incomplete. Please complete your profile first.', 400));
    }

    console.log('📦 [Donations] Fetching donations for city:', adminCity);

    // Get households in this city
    const householdsInCity = await User.find({ role: 'HOUSEHOLD', city: adminCity }).select('_id');
    const householdIds = householdsInCity.map(h => h._id);

    // Build filter
    const filter = { userId: { $in: householdIds } };
    if (status) filter.status = status;

    const searchRegex = new RegExp(search, 'i');

    const donations = await Donation.find(filter)
      .populate('userId', 'name email locality')
      .populate('assignedNGO', 'name locality')
      .select('itemCategory quantity status createdAt pickupLocation userId')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Donation.countDocuments(filter);

    console.log('✅ [Donations] Found:', {
      count: donations.length,
      total: total,
      city: adminCity
    });

    res.status(200).json({
      success: true,
      data: donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ [Donations] Error:', error);
    next(error);
  }
};

/**
 * Get NGOs Overview
 */
exports.getNGOsOverview = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, locality = '', isVerified = '' } = req.query;
    
    // Get admin's city
    const adminCity = await getAdminCity(req.user._id);
    if (!adminCity) {
      return next(new AppError('Admin profile incomplete. Please complete your profile first.', 400));
    }

    const filter = { role: 'NGO', city: adminCity };
    if (locality) filter.locality = new RegExp(locality, 'i');
    if (isVerified !== '') filter.isVerified = isVerified === 'true';

    const ngos = await User.find(filter)
      .select('name email phone locality city averageRating ratingCount isVerified verificationApprovedAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ verificationApprovedAt: -1 });

    const total = await User.countDocuments(filter);

    // Enrich with donation counts
    const enrichedNGOs = await Promise.all(
      ngos.map(async (ngo) => {
        const donationCount = await Donation.countDocuments({
          assignedNGO: ngo._id,
          status: 'COMPLETED'
        });
        return {
          ...ngo.toObject(),
          donationsReceived: donationCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedNGOs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Recyclers Overview
 */
exports.getRecyclersOverview = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, locality = '' } = req.query;
    
    // Get admin's city
    const adminCity = await getAdminCity(req.user._id);

    // Build filter - city is optional for recyclers (show all if no city set in profile)
    const filter = { role: 'RECYCLER' };
    if (adminCity) {
      filter.$or = [
        { city: adminCity },
        { city: { $exists: false } },
        { city: null }
      ];
    }
    if (locality) filter.locality = new RegExp(locality, 'i');

    const recyclers = await User.find(filter)
      .select('name email phone locality city averageRating ratingCount')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    // Enrich with pickup counts
    const enrichedRecyclers = await Promise.all(
      recyclers.map(async (recycler) => {
        const pickupCount = await Recycle.countDocuments({
          userId: recycler._id
        });
        return {
          ...recycler.toObject(),
          totalPickups: pickupCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedRecyclers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Platform Overview Stats
 */
exports.getPlatformStats = async (req, res, next) => {
  try {
    // Get admin's city
    const adminCity = await getAdminCity(req.user._id);
    if (!adminCity) {
      return next(new AppError('Admin profile incomplete. Please complete your profile first.', 400));
    }

    console.log('📊 [Admin Stats] Fetching stats for city:', adminCity);

    const totalHouseholds = await User.countDocuments({ role: 'HOUSEHOLD', city: adminCity });
    const totalNGOs = await User.countDocuments({ role: 'NGO', city: adminCity });
    const verifiedNGOs = await User.countDocuments({ role: 'NGO', isVerified: true, city: adminCity });
    const totalRecyclers = await User.countDocuments({ role: 'RECYCLER', city: adminCity });

    // Get donations from households in this city
    const householdsInCity = await User.find({ role: 'HOUSEHOLD', city: adminCity }).select('_id');
    const householdIds = householdsInCity.map(h => h._id);

    const totalDonations = await Donation.countDocuments({ userId: { $in: householdIds } });
    const completedDonations = await Donation.countDocuments({ 
      userId: { $in: householdIds },
      status: 'COMPLETED' 
    });
    const pendingDonations = await Donation.countDocuments({ 
      userId: { $in: householdIds },
      status: 'AVAILABLE' 
    });

    // Get recycles from recyclers/households in this city
    const usersInCity = await User.find({ 
      city: adminCity,
      role: { $in: ['HOUSEHOLD', 'RECYCLER'] }
    }).select('_id');
    const userIds = usersInCity.map(u => u._id);

    const totalRecycleActions = await Recycle.countDocuments({ userId: { $in: userIds } });

    console.log('✅ [Admin Stats] Stats calculated:', {
      city: adminCity,
      households: totalHouseholds,
      ngos: totalNGOs,
      donations: totalDonations,
      recycles: totalRecycleActions
    });

    res.status(200).json({
      success: true,
      data: {
        users: {
          totalHouseholds,
          totalNGOs,
          verifiedNGOs,
          totalRecyclers
        },
        donations: {
          total: totalDonations,
          completed: completedDonations,
          pending: pendingDonations
        },
        recycling: {
          total: totalRecycleActions
        }
      }
    });
  } catch (error) {
    console.error('❌ [Admin Stats] Error:', error);
    next(error);
  }
};

/**
 * Get Leaderboard - Global
 */
exports.getGlobalLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sortBy = 'totalPoints' } = req.query;

    const UserStats = require('../models/UserStats');
    
    const validSortFields = ['totalPoints', 'impactScore', 'level', 'badgesEarned'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'totalPoints';

    const users = await UserStats.find()
      .populate('userId', 'name email locality city profilePicture')
      .sort({ [sortField]: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await UserStats.countDocuments();

    console.log('🏆 [Admin Global Leaderboard] Fetching with sort:', {
      count: users.length,
      total: total,
      sortBy: sortField,
      userNames: users.map(u => ({ name: u.userId?.name, points: u[sortField] }))
    });

    // Get actual counts from database
    const leaderboard = await Promise.all(
      users.map(async (stat, index) => {
        const donationCount = await Donation.countDocuments({
          userId: stat.userId._id,
          status: 'COMPLETED'
        });
        const recycleCount = await Recycle.countDocuments({ userId: stat.userId._id });

        return {
          rank: (page - 1) * limit + index + 1,
          userId: stat.userId._id,
          name: stat.userId?.name,
          email: stat.userId?.email,
          locality: stat.userId?.locality,
          city: stat.userId?.city,
          profilePicture: stat.userId?.profilePicture,
          totalPoints: stat.totalPoints,
          level: stat.level,
          impactScore: stat.impactScore,
          badgesEarned: stat.badgesEarned,
          donations: donationCount,
          recycleActions: recycleCount,
          totalActions: donationCount + recycleCount,
          streak: stat.streak?.current || 0
        };
      })
    );

    res.status(200).json({
      success: true,
      data: leaderboard,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      sortedBy: sortField
    });
  } catch (error) {
    console.error('❌ [Admin Global Leaderboard] Error:', error);
    next(error);
  }
};

/**
 * Get Leaderboard by Locality
 */
exports.getLocalityLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Get admin's locality (NOT by URL parameter, by admin's own profile)
    const admin = await User.findById(req.user._id);
    const adminLocality = admin?.locality;

    if (!adminLocality || adminLocality === 'Not Set') {
      return next(new AppError('Admin profile incomplete. Please set your locality first.', 400));
    }

    const UserStats = require('../models/UserStats');

    console.log('📍 [Admin Locality Leaderboard] Fetching for locality:', adminLocality);

    // Find all users in the same locality
    const localUsers = await User.find({ locality: adminLocality }).select('_id');
    const localUserIds = localUsers.map(u => u._id);

    const users = await UserStats.find({ userId: { $in: localUserIds } })
      .populate('userId', 'name email locality city profilePicture')
      .sort({ totalPoints: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await UserStats.countDocuments({ userId: { $in: localUserIds } });

    console.log('📍 [Admin Locality Leaderboard] Found users:', {
      count: users.length,
      total: total,
      locality: adminLocality,
      userNames: users.map(u => ({ name: u.userId?.name, points: u.totalPoints }))
    });

    // Get actual counts from database
    const leaderboard = await Promise.all(
      users.map(async (stat, index) => {
        const donationCount = await Donation.countDocuments({
          userId: stat.userId._id,
          status: 'COMPLETED'
        });
        const recycleCount = await Recycle.countDocuments({ userId: stat.userId._id });

        return {
          rank: (page - 1) * limit + index + 1,
          userId: stat.userId._id,
          name: stat.userId?.name,
          email: stat.userId?.email,
          locality: stat.userId?.locality,
          city: stat.userId?.city,
          profilePicture: stat.userId?.profilePicture,
          totalPoints: stat.totalPoints,
          level: stat.level,
          impactScore: stat.impactScore,
          badgesEarned: stat.badgesEarned,
          donations: donationCount,
          recycleActions: recycleCount,
          totalActions: donationCount + recycleCount,
          streak: stat.streak?.current || 0
        };
      })
    );

    res.status(200).json({
      success: true,
      data: leaderboard,
      locality: adminLocality,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ [Admin Locality Leaderboard] Error:', error);
    next(error);
  }
};

/**
 * Get All Localities (for filter dropdowns)
 */
exports.getAllLocalities = async (req, res, next) => {
  try {
    // Get admin's city
    const adminCity = await getAdminCity(req.user._id);
    if (!adminCity) {
      return next(new AppError('Admin profile incomplete. Please complete your profile first.', 400));
    }

    const localities = await User.distinct('locality', {
      city: adminCity,
      locality: { $ne: null, $ne: 'Not Set' }
    });

    res.status(200).json({
      success: true,
      data: localities.sort()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Ratings - NGOs
 */
exports.getNGORatings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Get admin's city
    const adminCity = await getAdminCity(req.user._id);
    if (!adminCity) {
      return next(new AppError('Admin profile incomplete. Please complete your profile first.', 400));
    }

    const ngos = await User.find({ role: 'NGO', isVerified: true, city: adminCity })
      .select('name email locality averageRating ratingCount')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ averageRating: -1, ratingCount: -1 });

    const total = await User.countDocuments({ role: 'NGO', isVerified: true, city: adminCity });

    res.status(200).json({
      success: true,
      data: ngos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Ratings - Recyclers
 */
exports.getRecyclerRatings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Get admin's city
    const adminCity = await getAdminCity(req.user._id);

    // Build filter - city is optional for recyclers (show all if no city set in profile)
    const filter = { role: 'RECYCLER' };
    if (adminCity) {
      filter.$or = [
        { city: adminCity },
        { city: { $exists: false } },
        { city: null }
      ];
    }

    const recyclers = await User.find(filter)
      .select('name email locality averageRating ratingCount')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ averageRating: -1, ratingCount: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: recyclers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download Weekly Platform Activity Report (Excel)
 */
exports.downloadWeeklyReport = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;

    const buffer = await generateWeeklyReport(parseInt(days));

    const fileName = `weekly_platform_activity_report_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Download Donation Report (Excel)
 */
exports.downloadDonationReport = async (req, res, next) => {
  try {
    const { startDate, endDate, status, category } = req.query;

    const buffer = await generateDonationReport({
      startDate,
      endDate,
      status,
      category
    });

    const fileName = `donation_report_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Download NGO Performance Report (Excel)
 */
exports.downloadNGOPerformanceReport = async (req, res, next) => {
  try {
    const buffer = await generateNGOPerformanceReport();

    const fileName = `ngo_performance_report_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

