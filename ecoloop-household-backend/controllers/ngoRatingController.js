const NGORating = require('../models/NGORating');
const Donation = require('../models/Donation');
const User = require('../models/User');
const AppError = require('../utils/appError');

/**
 * Submit rating and feedback for NGO
 */
exports.submitNGORating = async (req, res, next) => {
  try {
    const { donationId, ngoId, rating, feedback, ratingType, isAnonymous } = req.body;
    const userId = req.user._id;

    console.log('⭐ [Submit Rating] ==========================================');
    console.log('⭐ [Submit Rating] Request body:', { donationId, ngoId, rating, feedback, ratingType, isAnonymous });
    console.log('⭐ [Submit Rating] User ID:', userId);
    console.log('⭐ [Submit Rating] User role:', req.user.role);

    // Validate required fields
    if (!donationId || !ngoId || !rating || !ratingType) {
      console.log('⭐ [Submit Rating] ❌ Missing fields:', { 
        donationId: !!donationId, 
        ngoId: !!ngoId, 
        rating: !!rating, 
        ratingType: !!ratingType 
      });
      return next(new AppError('Missing required fields', 400));
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      console.log('⭐ [Submit Rating] ❌ Invalid rating value:', rating);
      return next(new AppError('Rating must be between 1 and 5', 400));
    }

    // Check if valid ratingType
    if (!['ITEM_RECEIVED', 'DONATION_CANCELLED'].includes(ratingType)) {
      console.log('⭐ [Submit Rating] ❌ Invalid ratingType:', ratingType);
      return next(new AppError('Invalid rating type', 400));
    }

    // Verify donation exists and belongs to user
    const donation = await Donation.findById(donationId).populate('assignedNGO', '_id');
    console.log('⭐ [Submit Rating] Donation lookup:', { 
      found: !!donation,
      donationId: donation?._id,
      status: donation?.status, 
      userId: donation?.userId?.toString(),
      assignedNGO: donation?.assignedNGO?._id?.toString()
    });
    
    if (!donation) {
      console.log('⭐ [Submit Rating] ❌ Donation not found');
      return next(new AppError('Donation not found', 404));
    }

    if (donation.userId.toString() !== userId.toString()) {
      console.log('⭐ [Submit Rating] ❌ User mismatch:', { expected: userId.toString(), actual: donation.userId.toString() });
      return next(new AppError('You can only rate donations you made', 403));
    }

    if (!donation.assignedNGO) {
      console.log('⭐ [Submit Rating] ❌ No NGO assigned to donation');
      return next(new AppError('This donation has no assigned NGO', 400));
    }

    if (donation.assignedNGO._id.toString() !== ngoId.toString()) {
      console.log('⭐ [Submit Rating] ❌ NGO mismatch:', { expected: ngoId.toString(), actual: donation.assignedNGO._id.toString() });
      return next(new AppError('This NGO is not assigned to this donation', 403));
    }

    // Check if donation status is valid for rating
    console.log('⭐ [Submit Rating] Validating status:', { status: donation.status, ratingType });
    
    if (ratingType === 'ITEM_RECEIVED' && donation.status !== 'COMPLETED') {
      console.log('⭐ [Submit Rating] ❌ Invalid status for ITEM_RECEIVED. Expected COMPLETED, got:', donation.status);
      return next(new AppError('You can only rate completed donations', 400));
    }

    if (ratingType === 'DONATION_CANCELLED' && !['ACCEPTED', 'PICKED_UP'].includes(donation.status)) {
      console.log('⭐ [Submit Rating] ❌ Invalid status for DONATION_CANCELLED. Got:', donation.status);
      return next(new AppError('Invalid donation status for cancellation rating', 400));
    }

    // Check if rating already exists
    const existingRating = await NGORating.findOne({ donationId, userId });
    if (existingRating) {
      console.log('⭐ [Submit Rating] ❌ Duplicate rating found');
      return next(new AppError('You have already rated this donation', 400));
    }

    // Verify NGO exists
    const ngo = await User.findById(ngoId);
    if (!ngo || ngo.role !== 'NGO') {
      console.log('⭐ [Submit Rating] ❌ NGO not found or invalid role:', ngo?.role);
      return next(new AppError('NGO not found', 404));
    }

    // Create rating
    const ngoRating = await NGORating.create({
      donationId,
      userId,
      ngoId,
      rating,
      feedback: feedback || '',
      ratingType,
      isAnonymous: isAnonymous || false
    });

    // Update NGO's average rating
    const allRatings = await NGORating.find({ ngoId });
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    await User.findByIdAndUpdate(ngoId, { averageRating: Math.round(averageRating * 10) / 10 });

    console.log('⭐ [Submit Rating] ✅ Rating submitted successfully. NGO', ngoId, 'rated', rating, 'stars');
    console.log('⭐ [Submit Rating] ==========================================');

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: ngoRating
    });
  } catch (error) {
    console.error('❌ [Submit NGO Rating] Error:', error);
    next(error);
  }
};

/**
 * Get all ratings for an NGO (Admin & NGO view)
 */
exports.getNGORatings = async (req, res, next) => {
  try {
    const { ngoId } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt' } = req.query;

    // Verify NGO exists
    const ngo = await User.findById(ngoId);
    if (!ngo || ngo.role !== 'NGO') {
      return next(new AppError('NGO not found', 404));
    }

    // Check authorization - NGO can see own ratings, admin can see all
    if (req.user._id.toString() !== ngoId.toString() && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorized to view these ratings', 403));
    }

    const validSortFields = ['createdAt', 'rating'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const ratings = await NGORating.find({ ngoId })
      .populate('userId', 'name email locality')
      .populate('donationId', 'itemCategory quantity status createdAt')
      .sort({ [sortField]: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await NGORating.countDocuments({ ngoId });

    // Calculate statistics
    const allRatings = await NGORating.find({ ngoId });
    const stats = {
      totalRatings: allRatings.length,
      averageRating: allRatings.length > 0 
        ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(1)
        : 0,
      ratingBreakdown: {
        5: allRatings.filter(r => r.rating === 5).length,
        4: allRatings.filter(r => r.rating === 4).length,
        3: allRatings.filter(r => r.rating === 3).length,
        2: allRatings.filter(r => r.rating === 2).length,
        1: allRatings.filter(r => r.rating === 1).length
      }
    };

    // Hide user info if anonymous
    const formattedRatings = ratings.map(r => ({
      _id: r._id,
      rating: r.rating,
      feedback: r.feedback,
      ratingType: r.ratingType,
      createdAt: r.createdAt,
      donation: r.donationId,
      user: r.isAnonymous ? { name: 'Anonymous User', email: null, locality: null } : r.userId
    }));

    res.status(200).json({
      success: true,
      data: formattedRatings,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ [Get NGO Ratings] Error:', error);
    next(error);
  }
};

/**
 * Get rating summary for multiple NGOs (Admin Dashboard)
 */
exports.getNGOsRatingSummary = async (req, res, next) => {
  try {
    const ngos = await User.find({ role: 'NGO', isVerified: true })
      .select('_id name averageRating email city');

    const summary = await Promise.all(
      ngos.map(async (ngo) => {
        const ratings = await NGORating.find({ ngoId: ngo._id });
        return {
          ngoId: ngo._id,
          ngoName: ngo.name,
          email: ngo.email,
          city: ngo.city,
          averageRating: ngo.averageRating || 0,
          totalRatings: ratings.length,
          recentRating: ratings.length > 0 ? ratings[0].rating : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: summary.sort((a, b) => b.averageRating - a.averageRating)
    });
  } catch (error) {
    console.error('❌ [Get NGOs Rating Summary] Error:', error);
    next(error);
  }
};

/**
 * Delete a rating (Admin only)
 */
exports.deleteRating = async (req, res, next) => {
  try {
    const { ratingId } = req.params;

    // Check authorization
    if (req.user.role !== 'ADMIN') {
      return next(new AppError('Only admins can delete ratings', 403));
    }

    const rating = await NGORating.findByIdAndDelete(ratingId);
    if (!rating) {
      return next(new AppError('Rating not found', 404));
    }

    // Recalculate NGO's average rating
    const allRatings = await NGORating.find({ ngoId: rating.ngoId });
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : 0;

    await User.findByIdAndUpdate(rating.ngoId, { averageRating: Math.round(averageRating * 10) / 10 });

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    console.error('❌ [Delete Rating] Error:', error);
    next(error);
  }
};
