const Notification = require('../models/Notification');

// GET /api/notifications?unread=true
exports.getNotifications = async (req, res) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const notifications = await Notification.forUser(userId, unreadOnly);
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
};

// POST /api/notifications (admin)
exports.createNotification = async (req, res) => {
  try {
    const { user, title, message, type, data } = req.body;
    const n = await Notification.create({ user: user || null, title, message, type, data });
    res.status(201).json({ success: true, data: n });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to create notification', error: error.message });
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const n = await Notification.findById(req.params.id);
    if (!n) return res.status(404).json({ success: false, message: 'Notification not found' });
    // ensure ownership unless global
    if (n.user && n.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    n.isRead = true;
    await n.save();
    res.status(200).json({ success: true, data: n });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark as read', error: error.message });
  }
};

// DELETE /api/notifications/:id (admin)
exports.deleteNotification = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete', error: error.message });
  }
};
