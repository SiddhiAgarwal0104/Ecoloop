// controllers/request.controller.js

const BorrowRequest = require('../models/BorrowRequest');
const LendItem = require('../models/LendItem');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create new borrow/donate request
// @route   POST /api/requests/create
// @access  Private
exports.createRequest = async (req, res) => {
  try {
    const { itemId, requestType, quantityRequested, message, purpose, borrowDuration } = req.body;

    // Check if item exists
    const item = await LendItem.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item is available
    if (item.status !== 'available' || item.availableQuantity < quantityRequested) {
      return res.status(400).json({
        success: false,
        message: 'Item not available in requested quantity'
      });
    }

    // Check if user is owner
    if (item.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot request your own item'
      });
    }

    // Check for existing pending request
    const existingRequest = await BorrowRequest.findOne({
      item: itemId,
      requester: req.user.id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this item'
      });
    }

    const requestData = {
      item: itemId,
      requester: req.user.id,
      owner: item.owner,
      requestType,
      quantityRequested,
      message,
      purpose
    };

    // Add borrow duration if type is borrow
    if (requestType === 'borrow' && borrowDuration) {
      requestData.borrowDuration = borrowDuration;
    }

    const request = await BorrowRequest.create(requestData);

    // Create notification for owner
    await Notification.create({ user: item.owner, title: 'New request', message: `${req.user.name || 'A user'} requested your item '${item.title}'`, type: 'action', data: { requestId: request._id } });

    // Populate for response
    await request.populate('item', 'title category images');
    await request.populate('owner', 'name phone address');

    res.status(201).json({
      success: true,
      message: 'Request sent successfully',
      data: request
    });

  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create request',
      error: error.message
    });
  }
};

// @desc    Get pending requests for owner
// @route   GET /api/requests/pending
// @access  Private
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.getPendingForOwner(req.user.id);

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
};

// @desc    Get user's request history
// @route   GET /api/requests/my-requests
// @access  Private
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.getUserRequests(req.user.id);

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
};

// @desc    Get single request details
// @route   GET /api/requests/:id
// @access  Private
exports.getRequest = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id)
      .populate('item', 'title category images condition')
      .populate('requester', 'name phone address organizationDetails')
      .populate('owner', 'name phone address');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check authorization
    if (request.requester._id.toString() !== req.user.id && 
        request.owner._id.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request',
      error: error.message
    });
  }
};

// @desc    Accept request
// @route   PUT /api/requests/:id/accept
// @access  Private (Owner only)
exports.acceptRequest = async (req, res) => {
  try {
    const { acceptanceNote } = req.body;

    const request = await BorrowRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user is owner
    if (request.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this request'
      });
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`
      });
    }

    await request.acceptRequest(acceptanceNote);

    // Notify requester
    await Notification.create({ user: request.requester, title: 'Request accepted', message: `Your request for '${request.itemTitle || 'an item'}' has been accepted`, type: 'success', data: { requestId: request._id } });

    await request.populate('requester', 'name phone address');
    await request.populate('item', 'title category');

    res.status(200).json({
      success: true,
      message: 'Request accepted successfully',
      data: request
    });

  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept request',
      error: error.message
    });
  }
};

// @desc    Reject request
// @route   PUT /api/requests/:id/reject
// @access  Private (Owner only)
exports.rejectRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const request = await BorrowRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user is owner
    if (request.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this request'
      });
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`
      });
    }

    await request.rejectRequest(rejectionReason);

    // Notify requester
    await Notification.create({ user: request.requester, title: 'Request rejected', message: `Your request for '${request.itemTitle || 'an item'}' has been rejected`, type: 'warning', data: { requestId: request._id } });

    res.status(200).json({
      success: true,
      message: 'Request rejected',
      data: request
    });

  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject request',
      error: error.message
    });
  }
};

// @desc    Update request status (schedule, deliver, etc.)
// @route   PUT /api/requests/:id/status
// @access  Private
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, handover, return: returnData } = req.body;

    const request = await BorrowRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check authorization
    if (request.requester.toString() !== req.user.id && 
        request.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    // Update status
    if (status) {
      request.status = status;
    }

    // Update handover details
    if (handover) {
      request.handover = { ...request.handover.toObject(), ...handover };
    }

    // Update return details (for borrow)
    if (returnData) {
      request.return = { ...request.return.toObject(), ...returnData };
    }

    // If completed, call completion method
    if (status === 'completed') {
      await request.completeTransaction();
    } else {
      await request.save();
    }

    res.status(200).json({
      success: true,
      message: 'Request updated successfully',
      data: request
    });

  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request',
      error: error.message
    });
  }
};

// @desc    Cancel request
// @route   DELETE /api/requests/:id
// @access  Private (Requester only)
exports.cancelRequest = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user is requester
    if (request.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request'
      });
    }

    // Only pending requests can be cancelled
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled'
      });
    }

    request.status = 'cancelled';
    request.isDeleted = true;
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel request',
      error: error.message
    });
  }
};

// @desc    Add feedback/rating
// @route   POST /api/requests/:id/feedback
// @access  Private
exports.addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const request = await BorrowRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if request is completed
    if (request.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only add feedback for completed requests'
      });
    }

    // Determine who is giving feedback
    if (request.requester.toString() === req.user.id) {
      request.feedback.byRequester = {
        rating,
        comment,
        submittedAt: new Date()
      };
    } else if (request.owner.toString() === req.user.id) {
      request.feedback.byOwner = {
        rating,
        comment,
        submittedAt: new Date()
      };
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add feedback'
      });
    }

    await request.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: request.feedback
    });

  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add feedback',
      error: error.message
    });
  }
};