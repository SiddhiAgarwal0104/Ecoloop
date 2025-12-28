const WasteLog = require('../models/WasteLog');
const LendItem = require('../models/LendItem');

exports.getAnalytics = async (req, res) => {
  try {
    // Total waste logged
    const totalAgg = await WasteLog.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, totalWeightKg: { $sum: '$quantity.value' }, totalCO2: { $sum: '$impact.co2SavedKg' } } }
    ]);

    const totalWeightKg = (totalAgg[0] && totalAgg[0].totalWeightKg) || 0;
    const totalCO2 = (totalAgg[0] && totalAgg[0].totalCO2) || 0;

    // Category breakdown
    const category = await WasteLog.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', weightKg: { $sum: '$quantity.value' } } },
      { $project: { category: '$_id', weightKg: 1, _id: 0 } }
    ]);

    // Monthly comparison - last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthly = await WasteLog.aggregate([
      { $match: { isDeleted: false, wasteDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$wasteDate' }, month: { $month: '$wasteDate' } },
          totalWeightKg: { $sum: '$quantity.value' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Reuse vs Recycle stats (simple proxy using listingType)
    const reuseStats = await LendItem.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$listingType', count: { $sum: 1 } } }
    ]);

    res.status(200).json({ success: true, data: { totalWeightKg, totalCO2, category, monthly, reuseStats } });

  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
};