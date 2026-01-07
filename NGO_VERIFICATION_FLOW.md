# ✅ NGO Registration & Verification Flow - FIXED

## Summary of Changes

### 1. **Registration Flow (NEW)**
- **All users** (HOUSEHOLD, NGO, RECYCLER) now register with just name/email/password
- All users initially marked as `isVerified: false`
- All users redirected to `/profile/complete` after registration
- **NGO-specific**: After profile completion in their city, verification request sent to city admin

### 2. **Profile Completion Flow (UPDATED)**
- All users complete: phone, city, locality, pincode, address
- **NGO-specific**: Must also set location on map (latitude/longitude)
- After completion:
  - **Household/Recycler**: Marked `isVerified: true` → Can login immediately
  - **NGO**: Marked `isVerified: false`, `verificationRequestedAt: now()` → Sent to city admin for approval

### 3. **Login Flow (FIXED)**
- Email/password login now returns full response with role info
- Routes based on role:
  - **NGO**: `/ngo/dashboard` (if verified)
  - **RECYCLER**: `/recycler/dashboard`
  - **HOUSEHOLD**: `/dashboard`
- If NGO not verified: Shows message "admin will review soon" → Redirect to login

### 4. **NGO Fetching (FIXED)**
- New endpoint: `GET /api/ngos` (PUBLIC - no auth required)
- Returns: verified NGOs with name, rating, city, enrolled donations, completed donations
- Frontend API: `getAllNGOs()` with proper error handling
- Admin Dashboard: Shows table of verified NGOs, sortable by name/rating/donations

## Backend Changes

### authController.js
```javascript
// Register: All users marked unverified initially
user = await User.create({
  ...fields,
  isVerified: false,
  verificationRequestedAt: null
});

// Profile completion: NGO marked for verification after profile complete
if (user.role === 'NGO' && user.profileCompleted) {
  user.isVerified = false;
  user.verificationRequestedAt = new Date();
  // Messages: "Pending admin verification from your city"
}
```

### ngoController.js
```javascript
// NEW: Public endpoint to fetch all verified NGOs
exports.getAllVerifiedNGOs = async (req, res, next) => {
  // Returns paginated list of verified NGOs with donation counts
  // Sortable by: name, averageRating, city, createdAt
}
```

### ngoRoutes.js
```javascript
// Public route (no auth required)
router.get('/', getAllVerifiedNGOs);

// Protected routes (auth + NGO role required)
router.use(protect);
router.use(restrictTo('NGO'));
```

## Frontend Changes

### Register.jsx
```javascript
// ALL users go to profile completion (not just households)
navigate('/profile/complete');

// Google Auth: Check needsProfileCompletion first
if (response.needsProfileCompletion) {
  navigate('/profile/complete');
}
```

### CompleteProfile.jsx
```javascript
// NGO-specific messages
if (isNGO) {
  alert('Profile completed! Pending admin verification from your city');
  navigate('/login'); // Don't login yet - wait for admin approval
}

// Non-NGO users auto-login and navigate
else {
  navigate('/dashboard');
}
```

### Login.jsx (FIXED)
```javascript
// Now returns full response with user role
const response = await login(email, password);

// Route based on role
if (response.user.role === 'NGO') {
  navigate('/ngo/dashboard');
} else if (response.user.role === 'RECYCLER') {
  navigate('/recycler/dashboard');
} else {
  navigate('/dashboard');
}
```

### AuthContext.jsx (FIXED)
```javascript
// Login now returns response object
const login = async (email, password) => {
  // ...
  return {
    success: true,
    user: res.data.data.user,
    needsProfileCompletion: !res.data.data.user.profileCompleted
  };
}
```

### AdminDashboard.jsx (UPDATED)
```javascript
// Added NGO fetching and display
const fetchVerifiedNGOs = async () => {
  const result = await getAllNGOs({ limit: 50 });
  setNgos(result.data);
}

// Display table of verified NGOs with sorting
```

### ngosAPI.js (NEW)
```javascript
// Main function to fetch all verified NGOs
export const getAllNGOs = async (options = {}) => {
  // pagination, search, sorting support
  // Returns: { success, data: [], pagination, count }
}
```

## User Experience Flow

### NGO Registration
1. **Register page**: Name, email, password, role=NGO
2. **Profile page**: City, locality, address, phone, map location
3. **Verification request**: Sent to admin of that city
4. **Admin reviews**: Can approve/reject
5. **NGO login**: Can now access dashboard

### Admin Verification (Already Implemented)
1. **Admin dashboard**: See pending NGO verifications
2. **Review page**: Check NGO details
3. **Approve/Reject**: Update verification status
4. **NGO notified**: Via email (future enhancement)

### Household Registration
1. **Register page**: Name, email, password, role=HOUSEHOLD
2. **Profile page**: City, locality, address, phone (no map required)
3. **Auto-verified**: `isVerified: true`
4. **Dashboard access**: Immediate

## Testing Checklist

- [ ] New NGO registers → Goes to profile completion
- [ ] NGO completes profile → Verification request sent
- [ ] Admin approves NGO → NGO can login
- [ ] NGO login → Goes to `/ngo/dashboard`
- [ ] Household login → Goes to `/dashboard`
- [ ] Admin dashboard → Shows table of verified NGOs
- [ ] Admin can sort NGOs by rating
- [ ] NGO fetching works (no hardcoded data)

## API Endpoints

### Public
- `GET /api/ngos` - List verified NGOs
- `GET /api/ngos?sortBy=averageRating` - Sort by rating
- `GET /api/ngos?search=query` - Search NGOs
- `GET /api/ngos?limit=50&page=1` - Pagination

### Auth
- `POST /api/auth/register` - Create user (all roles)
- `POST /api/auth/login` - Login (checks verification)
- `POST /api/auth/google` - Google auth
- `PUT /api/auth/profile` - Complete profile (triggers NGO verification)

### Admin
- `GET /api/admin/ngos/pending` - Pending verifications
- `POST /api/admin/ngos/:id/approve` - Approve NGO
- `POST /api/admin/ngos/:id/reject` - Reject NGO
