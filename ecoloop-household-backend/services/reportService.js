const ExcelJS = require('exceljs');
const Donation = require('../models/Donation');
const Recycle = require('../models/Recycle');
const User = require('../models/User');
const Recycler = require('../models/Recycler');

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

    // ✅ FIX: Fetch recycling data with proper recycler population
    const recycleActions = await Recycle.find({
      createdAt: { $gte: startDate }
    })
      .populate('userId', 'name email role locality')
      .populate('assignedRecycler', 'name email locality') // ✅ Added assignedRecycler
      .select('wasteCategory quantity unit status createdAt pickupLocation assignedRecycler')
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
      { metric: 'Completed Recycles', value: recycleActions.filter(r => r.status === 'RECYCLED').length }, // ✅ Added
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
      { header: 'Assigned Recycler', key: 'assignedRecycler', width: 20 }, // ✅ Added
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
        assignedRecycler: recycle.assignedRecycler?.name || 'Not Assigned', // ✅ Added
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
    const recyclerActions = recycleActions.filter(r => r.assignedRecycler).length; // ✅ Added

    activitySheet.addRows([
      { userType: 'Household', action: 'Donations', count: householdDonations },
      { userType: 'Household', action: 'Recycling Requests', count: householdRecycles },
      { userType: 'NGO', action: 'Donations Received', count: ngoDonations },
      { userType: 'Recycler', action: 'Recycles Handled', count: recyclerActions } // ✅ Added
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

/**
 * ✅ FIXED: Generate Recycler Performance Report
 * Now uses Recycler model instead of User model
 */
exports.generateRecyclerPerformanceReport = async () => {
  try {
    // ✅ FIX: Query Recycler model instead of User model
    const recyclers = await Recycler.find({ 
      verificationStatus: 'APPROVED',
      isVerified: true 
    })
      .select('name email locality phone city rating completedRequests totalWasteCollected verificationApprovedAt')
      .lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Recycler Performance');

    sheet.columns = [
      { header: 'Recycler Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Locality', key: 'locality', width: 20 },
      { header: 'Average Rating', key: 'rating', width: 15 },
      { header: 'Total Requests', key: 'totalRequests', width: 12 },
      { header: 'Completed Requests', key: 'completedRequests', width: 15 },
      { header: 'Completion Rate (%)', key: 'completionRate', width: 15 },
      { header: 'Total Waste Collected (KG)', key: 'totalWaste', width: 20 },
      { header: 'Verified Date', key: 'verifiedDate', width: 12 }
    ];

    const header = sheet.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2e7d32' }
    };

    for (const recycler of recyclers) {
      // ✅ FIX: Use assignedRecycler field from Recycle model
      const recycleCount = await Recycle.countDocuments({
        assignedRecycler: recycler._id,
        status: 'RECYCLED'
      });

      // ✅ FIX: Use assignedRecycler field in aggregation
      const totalWasteData = await Recycle.aggregate([
        { 
          $match: { 
            assignedRecycler: recycler._id, 
            status: 'RECYCLED', 
            unit: 'KG' 
          } 
        },
        { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
      ]);

      const totalWaste = totalWasteData.length > 0 ? totalWasteData[0].totalQuantity : 0;
      
      // ✅ Calculate completion rate
      const completionRate = recycler.completedRequests && recycler.completedRequests > 0
        ? ((recycler.completedRequests / (recycler.completedRequests + recycleCount)) * 100).toFixed(2)
        : '0.00';

      sheet.addRow({
        name: recycler.name || 'N/A',
        email: recycler.email,
        phone: recycler.phone || 'N/A',
        city: recycler.city || 'N/A',
        locality: recycler.locality || 'N/A',
        rating: recycler.rating ? recycler.rating.toFixed(2) : '0.00',
        totalRequests: recycler.completedRequests || 0,
        completedRequests: recycleCount,
        completionRate: completionRate,
        totalWaste: (recycler.totalWasteCollected || totalWaste).toFixed(2),
        verifiedDate: recycler.verificationApprovedAt ? new Date(recycler.verificationApprovedAt).toLocaleDateString() : 'N/A'
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw error;
  }
};

/**
 * ✅ FIXED: Generate Combined NGO & Recycler Performance Report
 * Now uses Recycler model for recyclers instead of User model
 */
exports.generateCombinedPartnerReport = async () => {
  try {
    const workbook = new ExcelJS.Workbook();

    // ============ NGO SHEET ============
    const ngoData = await User.find({ role: 'NGO', isVerified: true })
      .select('name email locality city averageRating ratingCount isVerified verificationApprovedAt')
      .lean();

    const ngoSheet = workbook.addWorksheet('NGOs');

    ngoSheet.columns = [
      { header: 'Partner Type', key: 'type', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 20 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Locality', key: 'locality', width: 20 },
      { header: 'Average Rating', key: 'rating', width: 15 },
      { header: 'Total Ratings', key: 'ratingCount', width: 12 },
      { header: 'Donations Completed', key: 'completed', width: 15 },
      { header: 'Verified Date', key: 'verifiedDate', width: 12 }
    ];

    const ngoHeader = ngoSheet.getRow(1);
    ngoHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ngoHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2e7d32' }
    };

    for (const ngo of ngoData) {
      const donationCount = await Donation.countDocuments({
        assignedNGO: ngo._id,
        status: 'COMPLETED'
      });

      ngoSheet.addRow({
        type: 'NGO',
        name: ngo.name,
        email: ngo.email,
        city: ngo.city || 'N/A',
        locality: ngo.locality || 'N/A',
        rating: ngo.averageRating ? ngo.averageRating.toFixed(2) : '0.00',
        ratingCount: ngo.ratingCount || 0,
        completed: donationCount,
        verifiedDate: ngo.verificationApprovedAt ? new Date(ngo.verificationApprovedAt).toLocaleDateString() : 'N/A'
      });
    }

    // ============ RECYCLER SHEET ============
    // ✅ FIX: Query Recycler model instead of User model
    const recyclerData = await Recycler.find({ 
      verificationStatus: 'APPROVED',
      isVerified: true 
    })
      .select('name email locality phone city rating completedRequests totalWasteCollected verificationApprovedAt')
      .lean();

    const recyclerSheet = workbook.addWorksheet('Recyclers');

    recyclerSheet.columns = [
      { header: 'Partner Type', key: 'type', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Locality', key: 'locality', width: 20 },
      { header: 'Average Rating', key: 'rating', width: 15 },
      { header: 'Completed Requests', key: 'completedRequests', width: 15 },
      { header: 'Recycling Completed', key: 'completed', width: 15 },
      { header: 'Total Waste (KG)', key: 'waste', width: 15 },
      { header: 'Verified Date', key: 'verifiedDate', width: 12 }
    ];

    const recyclerHeader = recyclerSheet.getRow(1);
    recyclerHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    recyclerHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2e7d32' }
    };

    for (const recycler of recyclerData) {
      // ✅ FIX: Use assignedRecycler field
      const recycleCount = await Recycle.countDocuments({
        assignedRecycler: recycler._id,
        status: 'RECYCLED'
      });

      // ✅ FIX: Use assignedRecycler field in aggregation
      const totalWasteData = await Recycle.aggregate([
        { 
          $match: { 
            assignedRecycler: recycler._id, 
            status: 'RECYCLED', 
            unit: 'KG' 
          } 
        },
        { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
      ]);

      const totalWaste = totalWasteData.length > 0 ? totalWasteData[0].totalQuantity : 0;

      recyclerSheet.addRow({
        type: 'Recycler',
        name: recycler.name || 'N/A',
        email: recycler.email,
        phone: recycler.phone || 'N/A',
        city: recycler.city || 'N/A',
        locality: recycler.locality || 'N/A',
        rating: recycler.rating ? recycler.rating.toFixed(2) : '0.00',
        completedRequests: recycler.completedRequests || 0,
        completed: recycleCount,
        waste: (recycler.totalWasteCollected || totalWaste).toFixed(2),
        verifiedDate: recycler.verificationApprovedAt ? new Date(recycler.verificationApprovedAt).toLocaleDateString() : 'N/A'
      });
    }

    // ============ SUMMARY SHEET ============
    const summarySheet = workbook.addWorksheet('Summary');
    workbook.worksheets[0] = summarySheet; // Move to first position

    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 15 }
    ];

    const summaryHeader = summarySheet.getRow(1);
    summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2e7d32' }
    };

    const totalNGODonations = await Donation.countDocuments({ status: 'COMPLETED' });
    const totalRecyclerActions = await Recycle.countDocuments({ status: 'RECYCLED' });
    
    // ✅ Calculate total waste from Recycler model
    const totalWasteCollected = recyclerData.reduce((sum, r) => sum + (r.totalWasteCollected || 0), 0);

    summarySheet.addRows([
      { metric: 'Report Generated', value: new Date().toLocaleDateString() },
      { metric: 'Total Verified NGOs', value: ngoData.length },
      { metric: 'Total Verified Recyclers', value: recyclerData.length },
      { metric: 'NGO Donations Completed', value: totalNGODonations },
      { metric: 'Recycler Actions Completed', value: totalRecyclerActions },
      { metric: 'Total Waste Collected (KG)', value: totalWasteCollected.toFixed(2) },
      { metric: 'Average NGO Rating', value: ngoData.length > 0 ? (ngoData.reduce((sum, n) => sum + (n.averageRating || 0), 0) / ngoData.length).toFixed(2) : '0.00' },
      { metric: 'Average Recycler Rating', value: recyclerData.length > 0 ? (recyclerData.reduce((sum, r) => sum + (r.rating || 0), 0) / recyclerData.length).toFixed(2) : '0.00' }
    ]);

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw error;
  }
};