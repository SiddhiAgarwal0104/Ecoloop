const express = require('express');
const router = express.Router();
const {
  adminLogin,
  registerAdmin,
  completeAdminProfile,
  getPendingNGOs,
  getVerifiedNGOs,
  approveNGO,
  rejectNGO,
  getPendingRecyclers,
  getVerifiedRecyclers,
  approveRecycler,
  rejectRecycler,
  getDonationsOverview,
  getRecyclesOverview,
  getNGOsOverview,
  getRecyclersOverview,
  getPlatformStats,
  getGlobalLeaderboard,
  getLocalityLeaderboard,
  getAllLocalities,
  getNGORatings,
  getRecyclerRatings,
  getRecyclerRatingsOverview,
  downloadWeeklyReport,
  downloadDonationReport,
  downloadNGOPerformanceReport,
  downloadRecyclerPerformanceReport,
  downloadCombinedPartnerReport
} = require('../controllers/adminController');

const { adminAuth, checkPermission, superAdminOnly } = require('../middleware/adminMiddleware');

// ============ AUTH ROUTES ============
router.post('/login', adminLogin);
router.post('/register', registerAdmin);
router.post('/profile/complete', adminAuth, completeAdminProfile);

// ============ PROTECTED ROUTES (Admin Auth Required) ============

// ---- Stats & Overview ----
router.get('/stats/platform', adminAuth, getPlatformStats);

// ---- NGO Management ----
router.get('/ngos/pending', adminAuth, checkPermission('canVerifyNGO'), getPendingNGOs);
router.get('/ngos/verified', adminAuth, getVerifiedNGOs);
router.put('/ngos/:ngoId/approve', adminAuth, checkPermission('canVerifyNGO'), approveNGO);
router.put('/ngos/:ngoId/reject', adminAuth, checkPermission('canVerifyNGO'), rejectNGO);

// ---- Recycler Management ----
router.get('/recyclers/pending', adminAuth, checkPermission('canVerifyNGO'), getPendingRecyclers);
router.get('/recyclers/verified', adminAuth, getVerifiedRecyclers);
router.put('/recyclers/:recyclerId/approve', adminAuth, checkPermission('canVerifyNGO'), approveRecycler);
router.put('/recyclers/:recyclerId/reject', adminAuth, checkPermission('canVerifyNGO'), rejectRecycler);

// ---- Donations Management ----
router.get('/donations', adminAuth, checkPermission('canManageDonations'), getDonationsOverview);

// ---- Recycles Management ----
router.get('/recycles', adminAuth, checkPermission('canManageDonations'), getRecyclesOverview);

// ---- Overview Data ----
router.get('/overview/ngos', adminAuth, getNGOsOverview);
router.get('/overview/recyclers', adminAuth, getRecyclersOverview);

// ---- Leaderboards ----
router.get('/leaderboard/global', adminAuth, getGlobalLeaderboard);
router.get('/leaderboard/locality/:locality', adminAuth, getLocalityLeaderboard);
router.get('/localities', adminAuth, getAllLocalities);

// ---- Ratings ----
router.get('/ratings/ngos', adminAuth, getNGORatings);
router.get('/ratings/recyclers', adminAuth, getRecyclerRatings);
router.get('/ratings/recyclers-overview', adminAuth, getRecyclerRatingsOverview);

// ---- Reports (Download Excel) ----
router.get('/reports/weekly', adminAuth, checkPermission('canDownloadReports'), downloadWeeklyReport);
router.get('/reports/donations', adminAuth, checkPermission('canDownloadReports'), downloadDonationReport);
router.get('/reports/ngo-performance', adminAuth, checkPermission('canDownloadReports'), downloadNGOPerformanceReport);
router.get('/reports/recycler-performance', adminAuth, checkPermission('canDownloadReports'), downloadRecyclerPerformanceReport);
router.get('/reports/combined-partners', adminAuth, checkPermission('canDownloadReports'), downloadCombinedPartnerReport);

module.exports = router;
