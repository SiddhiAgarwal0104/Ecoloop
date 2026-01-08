const RecyclerRating = require('../models/RecyclerRating');
const Recycle = require('../models/Recycle');
const Recycler = require('../models/Recycler');
const AppError = require('../utils/appError');

/**
 * Submit rating and feedback for Recycler
 */
exports.submitRecyclerRating = async (req, res, next) => {
  try {
    const { recycleId, recyclerId, rating, feedback, ratingType, isAnonymous } = req.body;
    const userId = req.user._id;

    console.log('⭐ [Recycler Rating] ==========================================');
    console.log('⭐ [Recycler Rating] Request body:', { recycleId, recyclerId, rating, feedback, ratingType, isAnonymous });
    console.log('⭐ [Recycler Rating] User ID:', userId);

    // Validate required fields
    if (!recycleId || !recyclerId || !rating || !ratingType) {
      console.log('⭐ [Recycler Rating] ❌ Missing fields');
      return next(new AppError('Missing required fields', 400));
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }

    // Check if valid ratingType
    if (!['PICKUP_COMPLETED', 'REQUEST_CANCELLED'].includes(ratingType)) {
      return next(new AppError('Invalid rating type', 400));
    }

    // Verify recycle request exists and belongs to user
    const recycle = await Recycle.findById(recycleId).populate('assignedRecycler', '_id');
    
    console.log('⭐ [Recycler Rating] Recycle lookup:', { 
      found: !!recycle,
      recycleId: recycle?._id,
      status: recycle?.status, 
      userId: recycle?.userId?.toString(),
      assignedRecycler: recycle?.assignedRecycler?._id?.toString()
    });

    if (!recycle) {
      console.log('⭐ [Recycler Rating] ❌ Recycle not found');
      return next(new AppError('Recycle request not found', 404));
    }

    if (!recycle.userId) {
      console.log('⭐ [Recycler Rating] ❌ Recycle has no userId field');
      return next(new AppError('Recycle request data is invalid', 400));
    }

    if (recycle.userId.toString() !== userId.toString()) {
      console.log('⭐ [Recycler Rating] ❌ User mismatch:', { expected: userId.toString(), actual: recycle.userId.toString() });
      return next(new AppError('You can only rate recycle requests you made', 403));
    }

    if (!recycle.assignedRecycler) {
      return next(new AppError('This request has no assigned recycler', 400));
    }

    if (recycle.assignedRecycler._id.toString() !== recyclerId.toString()) {
      return next(new AppError('This recycler is not assigned to this request', 403));
    }

    // Check if recycle status is valid for rating
    if (ratingType === 'PICKUP_COMPLETED' && recycle.status !== 'RECYCLED') {
      return next(new AppError('You can only rate completed requests', 400));
    }

    if (ratingType === 'REQUEST_CANCELLED' && !['ACCEPTED', 'PICKED_UP'].includes(recycle.status)) {
      return next(new AppError('Invalid request status for cancellation rating', 400));
    }

    // Check if rating already exists
    const existingRating = await RecyclerRating.findOne({ recycleId, userId });
    if (existingRating) {
      return next(new AppError('You have already rated this request', 400));
    }

    // Verify recycler exists
    const recycler = await Recycler.findById(recyclerId);
    if (!recycler) {
      return next(new AppError('Recycler not found', 404));
    }

    // Create rating
    const recyclerRating = await RecyclerRating.create({
      recycleId,
      userId,
      recyclerId,
      rating,
      feedback: feedback || '',
      ratingType,
      isAnonymous: isAnonymous || false
    });

    // Update Recycler's average rating
    const allRatings = await RecyclerRating.find({ recyclerId });
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    await Recycler.findByIdAndUpdate(recyclerId, { rating: Math.round(averageRating * 10) / 10 });

    console.log('⭐ [Recycler Rating] ✅ Rating submitted successfully');

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: recyclerRating
    });
  } catch (error) {
    console.error('❌ [Submit Recycler Rating] Error:', error);
    next(error);
  }
};

/**
 * Get all ratings for a Recycler
 */
exports.getRecyclerRatings = async (req, res, next) => {
  try {
    const { recyclerId } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt' } = req.query;

    // Verify recycler exists
    const recycler = await Recycler.findById(recyclerId);
    if (!recycler) {
      return next(new AppError('Recycler not found', 404));
    }

    // Check authorization - Recycler can see own ratings, admin can see all
    if (req.user._id.toString() !== recyclerId.toString() && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorized to view these ratings', 403));
    }

    const validSortFields = ['createdAt', 'rating'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const ratings = await RecyclerRating.find({ recyclerId })
      .populate('userId', 'name email locality')
      .populate('recycleId', 'wasteCategory quantity status createdAt')
      .sort({ [sortField]: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await RecyclerRating.countDocuments({ recyclerId });

    // Calculate statistics
    const allRatings = await RecyclerRating.find({ recyclerId });
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
      recycle: r.recycleId,
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
    console.error('❌ [Get Recycler Ratings] Error:', error);
    next(error);
  }
};

/**
 * Delete a rating (Admin only)
 */
exports.deleteRecyclerRating = async (req, res, next) => {
  try {
    const { ratingId } = req.params;

    const rating = await RecyclerRating.findByIdAndDelete(ratingId);

    if (!rating) {
      return next(new AppError('Rating not found', 404));
    }

    // Recalculate recycler's average rating
    const allRatings = await RecyclerRating.find({ recyclerId: rating.recyclerId });
    const averageRating = allRatings.length > 0
      ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(1)
      : 0;

    await Recycler.findByIdAndUpdate(rating.recyclerId, { rating: averageRating });

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    console.error('❌ [Delete Recycler Rating] Error:', error);
    next(error);
  }
};
