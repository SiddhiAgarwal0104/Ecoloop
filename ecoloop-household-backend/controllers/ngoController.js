const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const User = require('../models/User');

// ================= CALCULATE DISTANCE (Haversine Formula) =================
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

exports.getAvailableDonations = async (req, res, next) => {
  try {
    const { radius = 50, category } = req.query;
    const ngoUser = req.user;

    console.log('🔍 NGO User:', {
      id: ngoUser._id,
      name: ngoUser.name,
      role: ngoUser.role,
      location: ngoUser.location
    });

    // STRICT VALIDATION: NGO must have location set
    if (!ngoUser.location || 
        typeof ngoUser.location.latitude !== 'number' || 
        typeof ngoUser.location.longitude !== 'number' ||
        isNaN(ngoUser.location.latitude) || 
        isNaN(ngoUser.location.longitude)) {
      
      console.error('❌ NGO location invalid:', ngoUser.location);
      return next(new AppError('Please complete your profile and set your NGO location on the map', 400));
    }

    const ngoLat = ngoUser.location.latitude;
    const ngoLng = ngoUser.location.longitude;

    console.log('📍 NGO Location:', { latitude: ngoLat, longitude: ngoLng });

    // Build filter for donations
    const filter = { 
      status: 'AVAILABLE',
      assignedNGO: null 
    };

    if (category) {
      filter.itemCategory = category.toUpperCase();
    }

    // Get all available donations
    const donations = await Donation.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    console.log(`Found ${donations.length} total available donations`);

    // Calculate distance and filter by radius
    const donationsWithDistance = [];
    
    for (const donation of donations) {
      // Validate donation location
      if (!donation.pickupLocation || 
          typeof donation.pickupLocation.latitude !== 'number' ||
          typeof donation.pickupLocation.longitude !== 'number') {
        console.warn('Skipping donation with invalid location:', donation._id);
        continue;
      }

      const distance = calculateDistance(
        ngoLat,
        ngoLng,
        donation.pickupLocation.latitude,
        donation.pickupLocation.longitude
      );

      const roundedDistance = Math.round(distance * 10) / 10;

      console.log(`Donation ${donation._id}: ${roundedDistance} km away`);

      if (roundedDistance <= parseFloat(radius)) {
        donationsWithDistance.push({
          ...donation.toObject(),
          distance: roundedDistance,
        });
      }
    }

    // Sort by nearest first
    donationsWithDistance.sort((a, b) => a.distance - b.distance);

    console.log(`Returning ${donationsWithDistance.length} donations within ${radius}km`);

    res.status(200).json({
      success: true,
      count: donationsWithDistance.length,
      data: donationsWithDistance,
    });
  } catch (error) {
    console.error('Error in getAvailableDonations:', error);
    next(error);
  }
};

// @desc    Get donation details
// @route   GET /api/ngo/donations/:id
// @access  Private (NGO only)
exports.getDonationDetails = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }

    // Calculate distance if NGO has location
    const ngoUser = req.user;
    let distance = null;

    if (ngoUser.location?.latitude && ngoUser.location?.longitude) {
      distance = calculateDistance(
        ngoUser.location.latitude,
        ngoUser.location.longitude,
        donation.pickupLocation.latitude,
        donation.pickupLocation.longitude
      );
      distance = Math.round(distance * 10) / 10;
    }

    res.status(200).json({
      success: true,
      data: {
        ...donation.toObject(),
        distance,
      },
    });
  } catch (error) {
    console.error('Error fetching donation:', error);
    next(error);
  }
};

// @desc    Accept a donation
// @route   POST /api/ngo/donations/:id/accept
// @access  Private (NGO only)
exports.acceptDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }

    if (donation.status !== 'AVAILABLE') {
      return next(new AppError('Donation is no longer available', 400));
    }

    donation.status = 'ACCEPTED';
    donation.assignedNGO = req.user.id;
    await donation.save();

    // Create notification
    await Notification.create({
      userId: donation.userId,
      type: 'DONATION_ACCEPTED',
      title: 'Donation Accepted',
      message: `Your ${donation.itemCategory.toLowerCase()} donation has been accepted by ${req.user.name}.`,
      donationId: donation._id,
    });

    console.log(`Donation ${donation._id} accepted by NGO ${req.user.name}`);

    res.status(200).json({
      success: true,
      message: 'Donation accepted successfully',
      data: donation,
    });
  } catch (error) {
    console.error('Error accepting donation:', error);
    next(error);
  }
};

// @desc    Get NGO's accepted donations
// @route   GET /api/ngo/donations/accepted
// @access  Private (NGO only)
exports.getAcceptedDonations = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = { 
      assignedNGO: req.user.id 
    };

    if (status) {
      filter.status = status.toUpperCase();
    }

    const donations = await Donation.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    console.error('Error fetching accepted donations:', error);
    next(error);
  }
};

// @desc    Update donation status
// @route   PUT /api/ngo/donations/:id/status
// @access  Private (NGO only)
exports.updateDonationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }

    if (donation.assignedNGO.toString() !== req.user.id) {
      return next(new AppError('Not authorized to update this donation', 403));
    }

    const validStatuses = ['ACCEPTED', 'PICKED_UP', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    donation.status = status;
    await donation.save();

    // Create notification
    let notificationMessage = '';
    if (status === 'PICKED_UP') {
      notificationMessage = `Your ${donation.itemCategory.toLowerCase()} donation has been picked up by ${req.user.name}.`;
    } else if (status === 'COMPLETED') {
      notificationMessage = `Your ${donation.itemCategory.toLowerCase()} donation has been successfully completed. Thank you!`;
    }

    if (notificationMessage) {
      await Notification.create({
        userId: donation.userId,
        type: 'DONATION_STATUS_UPDATE',
        title: 'Status Update',
        message: notificationMessage,
        donationId: donation._id,
      });
    }

    console.log(`Donation ${donation._id} status updated to ${status}`);

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: donation,
    });
  } catch (error) {
    console.error('Error updating donation status:', error);
    next(error);
  }
};

// @desc    Get all verified NGOs for public listing
// @route   GET /api/ngos
// @access  Public
exports.getAllVerifiedNGOs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'name' } = req.query;
    
    console.log('🔍 Fetching verified NGOs:', { page, limit, search, sortBy });

    // Build filter - only verified NGOs
    const filter = { 
      role: 'NGO',
      isVerified: true 
    };

    // Add search filter if provided
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    // Define valid sort fields
    const validSortFields = ['name', 'averageRating', 'city', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortOrder = sortBy === 'averageRating' ? -1 : 1; // Descending for rating

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch NGOs
    const ngos = await User.find(filter)
      .select('_id name email phone city locality address averageRating isVerified profilePicture')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    // Count total NGOs
    const total = await User.countDocuments(filter);

    // Enrich NGO data with donation counts
    const enrichedNGOs = await Promise.all(
      ngos.map(async (ngo) => {
        
        
        const enrolledDonations = await Donation.countDocuments({ 
          assignedNGO: ngo._id,
          status: { $ne: 'CANCELLED' }
        });

        const completedDonations = await Donation.countDocuments({ 
          assignedNGO: ngo._id,
          status: 'COMPLETED'
        });

        return {
          _id: ngo._id,
          name: ngo.name,
          email: ngo.email,
          phone: ngo.phone || 'Not provided',
          city: ngo.city || 'Not set',
          locality: ngo.locality || 'Not set',
          address: ngo.address || 'Not set',
          averageRating: ngo.averageRating || 0,
          isVerified: ngo.isVerified,
          profilePicture: ngo.profilePicture,
          enrolledDonations,
          completedDonations
        };
      })
    );

    console.log(`Found ${ngos.length} verified NGOs out of ${total} total`);

    res.status(200).json({
      success: true,
      count: enrichedNGOs.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: enrichedNGOs
    });
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    next(error);
  }
};