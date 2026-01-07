const ExcelJS = require('exceljs');
const Donation = require('../models/Donation');
const Recycle = require('../models/Recycle');
const User = require('../models/User');

/**
 * Generate Weekly Platform Activity Report
 * Returns Excel file buffer
 */
exports.generateWeeklyReport = async (days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch donations data
    const donations = await Donation.find({
      createdAt: { $gte: startDate }
    })
      .populate('userId', 'name email role locality')
      .populate('assignedNGO', 'name')
      .select('itemCategory quantity status createdAt pickupLocation assignedNGO')
      .lean();

    // Fetch recycling data
    const recycleActions = await Recycle.find({
      createdAt: { $gte: startDate }
    })
      .populate('userId', 'name email role locality')
      .select('wasteCategory quantity unit status createdAt pickupLocation')
      .lean();

    // Create workbook
    const workbook = new ExcelJS.Workbook();

    // ============ SUMMARY SHEET ============
    const summarySheet = workbook.addWorksheet('Summary');

    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 15 }
    ];

    const summarySheet_Header = summarySheet.getRow(1);
    summarySheet_Header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summarySheet_Header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2e7d32' }
    };

    summarySheet.addRows([
      { metric: 'Report Period', value: `Last ${days} days` },
      { metric: 'Generated Date', value: new Date().toLocaleDateString() },
      { metric: 'Total Donations', value: donations.length },
      { metric: 'Completed Donations', value: donations.filter(d => d.status === 'COMPLETED').length },
      { metric: 'Pending Donations', value: donations.filter(d => d.status === 'AVAILABLE').length },
      { metric: 'Total Recycle Actions', value: recycleActions.length },
      { metric: 'Total Quantity Recycled (KG)', value: recycleActions.reduce((sum, r) => sum + (r.unit === 'KG' ? r.quantity : 0), 0).toFixed(2) }
    ]);

    // ============ DONATIONS SHEET ============
    const donationsSheet = workbook.addWorksheet('Donations');

    donationsSheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Household Name', key: 'householdName', width: 20 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Assigned NGO', key: 'assignedNGO', width: 20 },
      { header: 'Locality', key: 'locality', width: 20 },
      { header: 'Address', key: 'address', width: 30 }
    ];

    const donationsHeader = donationsSheet.getRow(1);
    donationsHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    donationsHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2e7d32' }
    };

    donations.forEach(donation => {
      donationsSheet.addRow({
        date: new Date(donation.createdAt).toLocaleDateString(),
        householdName: donation.userId?.name || 'N/A',
        category: donation.itemCategory,
        quantity: donation.quantity,
        status: donation.status,
        assignedNGO: donation.assignedNGO?.name || 'Not Assigned',
        locality: donation.userId?.locality || 'N/A',
        address: donation.pickupLocation?.address || 'N/A'
      });
    });

    // ============ RECYCLING SHEET ============
    const recycleSheet = workbook.addWorksheet('Recycling');

    recycleSheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'User Name', key: 'userName', width: 20 },
      { header: 'Waste Category', key: 'category', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Unit', key: 'unit', width: 8 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Locality', key: 'locality', width: 20 },
      { header: 'Address', key: 'address', width: 30 }
    ];

    const recycleHeader = recycleSheet.getRow(1);
    recycleHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    recycleHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2e7d32' }
    };

    recycleActions.forEach(recycle => {
      recycleSheet.addRow({
        date: new Date(recycle.createdAt).toLocaleDateString(),
        userName: recycle.userId?.name || 'N/A',
        category: recycle.wasteCategory,
        quantity: recycle.quantity,
        unit: recycle.unit,
        status: recycle.status,
        locality: recycle.userId?.locality || 'N/A',
        address: recycle.pickupLocation?.address || 'N/A'
      });
    });

    // ============ ACTIVITY BY USER TYPE SHEET ============
    const activitySheet = workbook.addWorksheet('Activity by Type');

    activitySheet.columns = [
      { header: 'User Type', key: 'userType', width: 20 },
      { header: 'Action', key: 'action', width: 20 },
      { header: 'Count', key: 'count', width: 10 }
    ];

    const activityHeader = activitySheet.getRow(1);
    activityHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    activityHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2e7d32' }
    };

    const householdDonations = donations.filter(d => d.userId?.role === 'HOUSEHOLD').length;
    const ngoDonations = donations.filter(d => d.userId?.role === 'NGO').length;
    const householdRecycles = recycleActions.filter(r => r.userId?.role === 'HOUSEHOLD').length;

    activitySheet.addRows([
      { userType: 'Household', action: 'Donations', count: householdDonations },
      { userType: 'Household', action: 'Recycling', count: householdRecycles },
      { userType: 'NGO', action: 'Donations Received', count: ngoDonations }
    ]);

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return buffer;
  } catch (error) {
    throw error;
  }
};

/**
 * Generate Donation Report with Filters
 */
exports.generateDonationReport = async (filters = {}) => {
  try {
    const { startDate, endDate, status, category, assignedNGO } = filters;

    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (status) query.status = status;
    if (category) query.itemCategory = category;
    if (assignedNGO) query.assignedNGO = assignedNGO;

    const donations = await Donation.find(query)
      .populate('userId', 'name email locality')
      .populate('assignedNGO', 'name')
      .select('itemCategory quantity status createdAt pickupLocation')
      .lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Donations Report');

    sheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Household Name', key: 'householdName', width: 20 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Assigned NGO', key: 'assignedNGO', width: 20 },
      { header: 'Locality', key: 'locality', width: 20 }
    ];

    const header = sheet.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2e7d32' }
    };

    donations.forEach(donation => {
      sheet.addRow({
        date: new Date(donation.createdAt).toLocaleDateString(),
        householdName: donation.userId?.name || 'N/A',
        category: donation.itemCategory,
        quantity: donation.quantity,
        status: donation.status,
        assignedNGO: donation.assignedNGO?.name || 'Not Assigned',
        locality: donation.userId?.locality || 'N/A'
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw error;
  }
};

/**
 * Generate NGO Performance Report
 */
exports.generateNGOPerformanceReport = async () => {
  try {
    const ngos = await User.find({ role: 'NGO', isVerified: true })
      .select('name email locality averageRating ratingCount isVerified verificationApprovedAt')
      .lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('NGO Performance');

    sheet.columns = [
      { header: 'NGO Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 20 },
      { header: 'Locality', key: 'locality', width: 20 },
      { header: 'Average Rating', key: 'rating', width: 15 },
      { header: 'Total Ratings', key: 'ratingCount', width: 12 },
      { header: 'Verification Status', key: 'status', width: 15 },
      { header: 'Verified Date', key: 'verifiedDate', width: 12 },
      { header: 'Donations Completed', key: 'donations', width: 15 }
    ];

    const header = sheet.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2e7d32' }
    };

    for (const ngo of ngos) {
      const donationCount = await Donation.countDocuments({
        assignedNGO: ngo._id,
        status: 'COMPLETED'
      });

      sheet.addRow({
        name: ngo.name,
        email: ngo.email,
        locality: ngo.locality,
        rating: ngo.averageRating.toFixed(2),
        ratingCount: ngo.ratingCount,
        status: ngo.isVerified ? 'Verified' : 'Pending',
        verifiedDate: ngo.verificationApprovedAt ? new Date(ngo.verificationApprovedAt).toLocaleDateString() : 'N/A',
        donations: donationCount
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw error;
  }
};
