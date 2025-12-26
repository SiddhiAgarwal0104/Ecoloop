// controllers/lend.controller.js

const LendItem = require('../models/LendItem');
const User = require('../models/User');

// @desc    Create new lend/donate item listing
// @route   POST /api/lend/create
// @access  Private (Household only)
exports.createLendItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      condition,
      quantity,
      listingType,
      lendDuration,
      visibility,
      preferredReceiverType,
      handoverMethod,
      tags
    } = req.body;

    // Get user's location
    const user = await User.findById(req.user.id);

    const itemData = {
      owner: req.user.id,
      title,
      description,
      category,
      condition,
      quantity: quantity || 1,
      availableQuantity: quantity || 1,
      listingType,
      location: {
        locality: user.address.locality,
        city: user.address.city,
        pincode: user.address.pincode,
        coordinates: user.address.coordinates
      },
      visibility: visibility || 'locality-only',
      preferredReceiverType: preferredReceiverType || 'any',
      handoverMethod: handoverMethod || 'pickup'
    };

    // Add lend duration if listing type includes lending
    if (listingType === 'lend' || listingType === 'both') {
      if (lendDuration) {
        itemData.lendDuration = lendDuration;
      }
    }

    // Add tags
    if (tags && Array.isArray(tags)) {
      itemData.tags = tags;
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      itemData.images = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
    }

    // Create item
    const item = await LendItem.create(itemData);

    // Find matches automatically
    await item.findMatches();
    await item.save();

    // TODO: Send notifications to matched users

    res.status(201).json({
      success: true,
      message: 'Item listed successfully',
      data: item
    });

  } catch (error) {
    console.error('Create lend item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create item listing',
      error: error.message
    });
  }
};

// @desc    Get available items in user's locality
// @route   GET /api/lend/browse
// @access  Private
exports.browseItems = async (req, res) => {
  try {
    const { category, condition, search, page = 1, limit = 20 } = req.query;

    const user = await User.findById(req.user.id);

    const query = {
      status: 'available',
      isDeleted: false,
      isExpired: false,
      availableQuantity: { $gt: 0 },
      owner: { $ne: req.user.id } // Don't show own items
    };

    // Locality-based filtering
    if (user.role === 'household') {
      query['location.locality'] = user.address.locality;
    } else if (user.role === 'ngo' || user.role === 'recycler') {
      // NGOs can see within service radius
      query['location.locality'] = user.address.locality;
      
      // Also filter by accepted categories
      if (user.organizationDetails?.acceptedCategories?.length > 0) {
        query.category = { $in: user.organizationDetails.acceptedCategories };
      }
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Condition filter
    if (condition) {
      query.condition = condition;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const items = await LendItem.find(query)
      .populate('owner', 'name phone address organizationDetails')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LendItem.countDocuments(query);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: items
    });

  } catch (error) {
    console.error('Browse items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items',
      error: error.message
    });
  }
};

// @desc    Get single item details
// @route   GET /api/lend/item/:id
// @access  Private
exports.getItem = async (req, res) => {
  try {
    const item = await LendItem.findById(req.params.id)
      .populate('owner', 'name phone address organizationDetails');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (item.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Item no longer available'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });

  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch item',
      error: error.message
    });
  }
};

// @desc    Get user's own listed items
// @route   GET /api/lend/my-items
// @access  Private
exports.getMyItems = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {
      owner: req.user.id,
      isDeleted: false
    };

    if (status) {
      query.status = status;
    }

    const items = await LendItem.find(query)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });

  } catch (error) {
    console.error('Get my items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items',
      error: error.message
    });
  }
};

// @desc    Update item
// @route   PUT /api/lend/item/:id
// @access  Private
exports.updateItem = async (req, res) => {
  try {
    let item = await LendItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check ownership
    if (item.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    const {
      title,
      description,
      condition,
      quantity,
      status,
      handoverMethod
    } = req.body;

    // Update allowed fields
    if (title) item.title = title;
    if (description) item.description = description;
    if (condition) item.condition = condition;
    if (quantity) {
      item.quantity = quantity;
      item.availableQuantity = quantity;
    }
    if (status) item.status = status;
    if (handoverMethod) item.handoverMethod = handoverMethod;

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });

  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: error.message
    });
  }
};

// @desc    Delete/Mark item unavailable
// @route   DELETE /api/lend/item/:id
// @access  Private
exports.deleteItem = async (req, res) => {
  try {
    const item = await LendItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check ownership
    if (item.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    // Soft delete
    item.isDeleted = true;
    item.deletedAt = new Date();
    item.status = 'cancelled';
    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item removed successfully'
    });

  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message
    });
  }
};

// @desc    Get matched items for NGO/Recycler
// @route   GET /api/lend/matched
// @access  Private (NGO/Recycler only)
exports.getMatchedItems = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.organizationDetails?.acceptedCategories) {
      return res.status(400).json({
        success: false,
        message: 'Please update your accepted categories in profile'
      });
    }

    const items = await LendItem.find({
      'location.locality': user.address.locality,
      category: { $in: user.organizationDetails.acceptedCategories },
      status: 'available',
      isDeleted: false,
      availableQuantity: { $gt: 0 }
    })
      .populate('owner', 'name address')
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });

  } catch (error) {
    console.error('Get matched items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch matched items',
      error: error.message
    });
  }
};