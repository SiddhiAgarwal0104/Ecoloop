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
  getDonationsOverview,
  getNGOsOverview,
  getRecyclersOverview,
  getPlatformStats,
  getGlobalLeaderboard,
  getLocalityLeaderboard,
  getAllLocalities,
  getNGORatings,
  getRecyclerRatings,
  downloadWeeklyReport,
  downloadDonationReport,
  downloadNGOPerformanceReport
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

// ---- Donations Management ----
router.get('/donations', adminAuth, checkPermission('canManageDonations'), getDonationsOverview);

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

// ---- Reports (Download Excel) ----
router.get('/reports/weekly', adminAuth, checkPermission('canDownloadReports'), downloadWeeklyReport);
router.get('/reports/donations', adminAuth, checkPermission('canDownloadReports'), downloadDonationReport);
router.get('/reports/ngo-performance', adminAuth, checkPermission('canDownloadReports'), downloadNGOPerformanceReport);

module.exports = router;
