# 🧪 Complete System Testing Guide

## Frontend & Backend Integration Testing

---

## 📋 Pre-Testing Checklist

### Backend Ready?
- [ ] MongoDB is running
- [ ] `.env` file has all required variables:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `JWT_EXPIRE`
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
- [ ] Backend server running on port 5000: `npm start` or `node server.js`
- [ ] Check logs: Should see `✅ Database connected` and `🚀 Server running on port 5000`

### Frontend Ready?
- [ ] React app running on port 5173: `npm run dev`
- [ ] Browser DevTools open (F12)
- [ ] Console tab active to see logs

### Network Ready?
- [ ] CORS enabled for localhost:5173 and localhost:5174
- [ ] No proxy issues

---

## 🧪 Test Case 1: Admin Dashboard Data Fetching

### Objective
Verify that admin dashboard correctly fetches and displays platform statistics.

### Steps

#### 1. Admin Login
1. Navigate to `http://localhost:5173/admin-login`
2. Enter admin credentials:
   - Email: `admin@test.com` (or your test admin email)
   - Password: `admin123` (or correct password)
3. Submit and wait for redirect

#### 2. Check Browser Console Logs
Open browser DevTools → Console tab

**Look for these logs (in order):**

```
📡 [AdminDashboard] Fetching platform stats with token: true
```
✅ **PASS**: Token is being sent with request
❌ **FAIL**: Shows `false` - token not found in localStorage

```
✅ [AdminDashboard] Platform stats fetched successfully: {...}
```
✅ **PASS**: Data was received from backend
❌ **FAIL**: Shows error instead - check network tab

**Then check these detailed logs:**
```
   - City: <your-city-name>
   - Users: {totalHouseholds: X, totalNGOs: Y, verifiedNGOs: Z, totalRecyclers: W}
   - Donations: {total: X, completed: Y, pending: Z}
   - Recycling: {total: X, completed: Y, pending: Z}
```
✅ **PASS**: All four sections show data
❌ **FAIL**: Any missing or null values - check backend

#### 3. Check Backend Logs
Look at terminal running backend server

**Look for these logs:**

```
📊 [Admin Stats] Fetching stats for city: <city-name>
👥 [Admin Stats] User counts: {totalHouseholds: X, totalNGOs: Y, verifiedNGOs: Z, totalRecyclers: W}
🎁 [Admin Stats] Donation stats: {totalDonations: X, completedDonations: Y, pendingDonations: Z}
♻️ [Admin Stats] Recycling stats: {totalRecycleActions: X, completedRecycles: Y, pendingRecycles: Z}
✅ [Admin Stats] Stats calculated successfully for city: <city-name>
```

✅ **PASS**: All four stat types calculated
❌ **FAIL**: Any missing logs - check adminController.js

#### 4. Verify Dashboard Display
Check admin dashboard page displays:

**Section 1: Users Overview (4 cards)**
- [ ] Total Households: ≥ 0
- [ ] Total Recyclers: ≥ 0
- [ ] Total NGOs: ≥ 0
- [ ] Verified NGOs: ≤ Total NGOs

**Section 2: Donation vs Recycling**
- [ ] **Donations Card**:
  - [ ] Total Donations: ≥ 0
  - [ ] Completed: ≤ Total
  - [ ] Pending: ≤ Total
- [ ] **Recycling Card**:
  - [ ] Total Recycling: ≥ 0
  - [ ] Completed: ≤ Total (RECYCLED status)
  - [ ] Pending: ≤ Total (AVAILABLE, ACCEPTED, PICKED_UP)

**Section 3: Quick Actions**
- [ ] NGO Verification button visible
- [ ] Recycler Verification button visible
- [ ] Pending Donations button visible

**Section 4: Verified NGOs Table**
- [ ] List displays (empty if no NGOs, or shows NGO names)
- [ ] Sortable by columns

---

## 🧪 Test Case 2: Recycler Request Acceptance & Completion Flow

### Objective
Verify complete recycler workflow: view request → accept → mark complete → notifications.

### Prerequisites
- Create a household account with a recycle request
- Create a recycler account
- Both accounts registered and verified

### Steps

#### Phase 1: Household Creates Recycle Request
1. Login as household user
2. Go to "Create Recycle Request" (or similar page)
3. Fill form:
   - [ ] Waste Category: Select (e.g., PLASTIC)
   - [ ] Waste Type: Select (e.g., SEGREGATED)
   - [ ] Quantity: Enter number (e.g., 2.5)
   - [ ] Unit: Select KG
   - [ ] Description: Enter text
   - [ ] Images: Upload 1+ image to Cloudinary
   - [ ] Pickup Location: Enter address and pin location on map
4. Submit form
5. Check response:
   - ✅ **PASS**: Success message + redirect to "My Requests"
   - ❌ **FAIL**: Error message about images or location

**Console Logs to Check:**
```
📤 POST http://localhost:5000/api/recycle/create
✅ Recycle request created successfully
```

#### Phase 2: Recycler Views Available Requests
1. Logout household, login as recycler
2. Navigate to "Available Requests" or similar
3. Check request appears in list:
   - [ ] Household name visible
   - [ ] Waste category visible
   - [ ] Location visible
   - [ ] Images display correctly (from Cloudinary)
   - [ ] Quantity and unit visible

**Console Logs to Check:**
```
📤 GET http://localhost:5000/api/recycler/requests/available
✅ Loaded X available requests
```

#### Phase 3: Recycler Accepts Request
1. Click "Accept" button on the request
2. Check success response:
   - ✅ **PASS**: Request status changes to "ACCEPTED" + button disappears
   - ❌ **FAIL**: Error message appears

3. Click "View My Requests" or go to that page
4. Verify request appears with status "ACCEPTED"

**Console Logs to Check:**
```
📤 POST http://localhost:5000/api/recycler/requests/:requestId/accept
✅ Request accepted successfully
```

**Backend Logs to Check:**
```
✅ Request accepted successfully
🔔 Notification created for household
```

#### Phase 4: Household Receives Notification
1. Logout recycler, login as household
2. Go to "Notifications" page
3. Look for message: "YOUR RECYCLE REQUEST IS ACCEPTED BY A RECYCLER" or similar
   - ✅ **PASS**: Notification visible
   - ❌ **FAIL**: Notification missing - check console logs

**Console Logs to Check (Frontend):**
```
📬 Fetching notifications for HOUSEHOLD user <userId>
✅ Found X notifications
   - City: <city>
   - Users: {...}
   - Donations: {...}
   - Recycling: {...}
```

**Check Backend Logs:**
```
🔔 [Notification] Created notification for household
📬 Found X notifications
```

#### Phase 5: Recycler Marks Request as Complete
1. Logout household, login as recycler
2. Go to "My Requests" (should show ACCEPTED requests)
3. Find the request and click "Mark as Complete" button
4. Confirm action
5. Check response:
   - ✅ **PASS**: Request status changes to "RECYCLED" + button disappears
   - ❌ **FAIL**: Error message appears

**Console Logs to Check (Frontend):**
```
📤 Marking request <requestId> as complete...
✅ Request marked as complete: {...}
   - Status: RECYCLED
   - completedAt: <timestamp>
```

**Backend Logs to Check:**
```
📤 Marking request <requestId> as complete by recycler <recyclerId>
✅ Recycle request <requestId> marked as RECYCLED
✅ Updated recycler stats: X completed requests
🔔 [Notification] Created notification for recycler
🔔 [Notification] Created notification for household
```

#### Phase 6: Household Receives Completion Notification
1. Logout recycler, login as household
2. Go to "Notifications" page
3. Look for message: "YOUR WASTE HAS BEEN RECYCLED" or similar
   - ✅ **PASS**: Completion notification visible
   - ❌ **FAIL**: Notification missing

#### Phase 7: Admin Sees Updated Stats
1. Logout household, login as admin
2. Go to Admin Dashboard
3. Check "Recycling" card:
   - [ ] Total Recycling increased by 1
   - [ ] Completed Recycling increased by 1
   - [ ] Pending Recycling decreased by 1

**Expected Changes:**
- Before: Recycling {total: 5, completed: 2, pending: 3}
- After:  Recycling {total: 6, completed: 3, pending: 3}

---

## 🧪 Test Case 3: Notification Fetching for All Roles

### Objective
Verify notifications endpoint works for HOUSEHOLD, RECYCLER, NGO, and ADMIN roles.

### Steps

#### For Household User
1. Login as household
2. Navigate to Notifications page
3. Check browser console:
   ```
   📬 Fetching notifications for HOUSEHOLD user <userId>
   ✅ Found X notifications
   ```
4. Verify notifications display correctly
   - ✅ **PASS**: Notifications visible
   - ❌ **FAIL**: Empty or error shown

#### For Recycler User
1. Login as recycler
2. Navigate to Notifications page
3. Check browser console:
   ```
   📬 Fetching notifications for RECYCLER user <userId>
   ✅ Found X notifications
   ```
4. Verify notifications display correctly
   - ✅ **PASS**: Notifications visible (from request acceptance, completion, etc.)
   - ❌ **FAIL**: Empty or error shown

#### For NGO User
1. Login as NGO account (if available)
2. Navigate to Notifications page
3. Check endpoint still works:
   - ✅ **PASS**: Notifications displayed (any system notifications)
   - ❌ **FAIL**: Error due to role restriction

#### For Admin User
1. Login as admin account
2. Navigate to Notifications page (if available)
3. Verify endpoint works:
   - ✅ **PASS**: Notifications displayed
   - ❌ **FAIL**: Endpoint blocked

---

## 🧪 Test Case 4: Route Order Verification

### Objective
Verify specific routes work correctly and don't get caught by catch-all routes.

### Prerequisites
- Terminal access to run curl commands or Postman
- Valid JWT tokens for testing

### Test: /api/recycler/requests/my-requests
1. Get recycler's token
2. Run:
   ```bash
   curl -H "Authorization: Bearer <TOKEN>" \
        http://localhost:5000/api/recycler/requests/my-requests
   ```
3. Expected response:
   ```json
   {
     "success": true,
     "data": [...]  // Array of recycler's requests
   }
   ```
   - ✅ **PASS**: Returns array (even if empty)
   - ❌ **FAIL**: Returns error or single object

### Test: /api/badges/my
1. Get any user's token
2. Run:
   ```bash
   curl -H "Authorization: Bearer <TOKEN>" \
        http://localhost:5000/api/badges/my
   ```
3. Expected response:
   ```json
   {
     "success": true,
     "data": [...]  // Array of user's badges
   }
   ```
   - ✅ **PASS**: Returns array (even if empty)
   - ❌ **FAIL**: Returns error or single object

---

## 🧪 Test Case 5: Error Handling & Edge Cases

### Test: Missing Authentication Token
1. Try to fetch notifications without token:
   ```bash
   curl http://localhost:5000/api/notifications
   ```
2. Expected response: 401 Unauthorized
   ```json
   {
     "success": false,
     "message": "Please provide a valid token"
   }
   ```

### Test: Invalid JWT Token
1. Try with fake token:
   ```bash
   curl -H "Authorization: Bearer INVALID_TOKEN_HERE" \
        http://localhost:5000/api/notifications
   ```
2. Expected response: 401 Unauthorized
   ```json
   {
     "success": false,
     "message": "Invalid token"
   }
   ```

### Test: Non-Admin Accessing Admin Route
1. Login as household
2. Try to access admin route with household token:
   ```bash
   curl -H "Authorization: Bearer <HOUSEHOLD_TOKEN>" \
        http://localhost:5000/api/admin/stats/platform
   ```
3. Expected response: 403 Forbidden
   ```json
   {
     "success": false,
     "message": "Access denied. Admin role required"
   }
   ```

### Test: Admin Without Complete Profile
1. Create admin account without completing profile (no city)
2. Try to access admin stats:
   ```bash
   curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
        http://localhost:5000/api/admin/stats/platform
   ```
3. Expected response: 400 Bad Request
   ```json
   {
     "success": false,
     "message": "Admin profile incomplete. Please complete your profile first."
   }
   ```

---

## 📊 Test Results Summary

Create a table to track results:

| Test Case | Component | Status | Notes |
|-----------|-----------|--------|-------|
| TC1-Phase1 | Admin Dashboard Fetch | ✅/❌ | Check logs |
| TC1-Phase2 | Admin Dashboard Display | ✅/❌ | All cards visible |
| TC2-Phase1 | Household Create Request | ✅/❌ | Images uploaded |
| TC2-Phase2 | Recycler View Requests | ✅/❌ | Request visible |
| TC2-Phase3 | Recycler Accept Request | ✅/❌ | Status updated |
| TC2-Phase4 | Household Notification | ✅/❌ | Notification shown |
| TC2-Phase5 | Recycler Mark Complete | ✅/❌ | Status to RECYCLED |
| TC2-Phase6 | Household Completion Notif | ✅/❌ | Notification shown |
| TC2-Phase7 | Admin Stats Updated | ✅/❌ | Recycling count +1 |
| TC3-Household | Notifications (HOUSEHOLD) | ✅/❌ | Endpoint working |
| TC3-Recycler | Notifications (RECYCLER) | ✅/❌ | Endpoint working |
| TC3-NGO | Notifications (NGO) | ✅/❌ | Endpoint working |
| TC4-MyRequests | /recycler/requests/my-requests | ✅/❌ | Route matches correctly |
| TC4-MyBadges | /badges/my | ✅/❌ | Route matches correctly |
| TC5-NoToken | Missing Token Error | ✅/❌ | Returns 401 |
| TC5-BadToken | Invalid Token Error | ✅/❌ | Returns 401 |
| TC5-NonAdmin | Non-Admin Access Error | ✅/❌ | Returns 403 |
| TC5-NoCityAdmin | Admin No Profile Error | ✅/❌ | Returns 400 |

---

## 🔧 Debugging Tips

### If tests fail, check:

**Backend Issues:**
1. Terminal logs for 📊 [Admin Stats], 🔔 [Notification], 📤 messages
2. Database connection: `MongoDB connected to <URI>`
3. Routes mounted: Look for route initialization logs
4. Errors: ❌ [Controller] Error messages in terminal

**Frontend Issues:**
1. Browser console for 📡, 📬, 📤 logs
2. Network tab: Check request headers and response
3. Storage: Check localStorage for tokens
4. Check CORS headers in response

**Common Issues:**
- 🔴 **401 Unauthorized**: Token missing or invalid
  - Solution: Check localStorage.token exists and is valid
- 🔴 **403 Forbidden**: Missing permission or wrong role
  - Solution: Check user.role matches required role
- 🔴 **404 Not Found**: Route not matching correctly
  - Solution: Verify route order (specific before catch-all)
- 🔴 **Notifications not appearing**: Fetch failing
  - Solution: Check console logs for errors, verify route is `/api/notifications`

---

## ✅ Success Criteria

**All tests PASS when:**
- ✅ Admin dashboard loads with all stats populated
- ✅ Recycler can view, accept, and complete requests
- ✅ Notifications sent and received by both users
- ✅ Admin stats update when request completes
- ✅ All notifications work for all user roles
- ✅ Routes match correctly (no catch-all issues)
- ✅ Proper error handling for all edge cases

**If all above PASS**: 🎉 **System is ready for production testing!**

---

## 📝 Logging Reference

### Frontend Logs to Monitor
- `📡 [AdminDashboard]` - Admin dashboard data fetching
- `📬 [Notifications]` - Notification fetching
- `📤 POST/GET/PUT` - API requests
- `✅ [Component]` - Successful operations
- `❌ [Component]` - Errors
- `   -` - Detailed data logging

### Backend Logs to Monitor
- `📊 [Admin Stats]` - Admin stats calculation
- `👥 [Admin Stats]` - User counts
- `🎁 [Admin Stats]` - Donation stats
- `♻️ [Admin Stats]` - Recycling stats
- `🔔 [Notification]` - Notification creation
- `📬 [Notification]` - Notification fetching
- `📤 [Request]` - Request marked complete
- `✅ [Component]` - Success messages
- `❌ [Component]` - Errors

---

**Last Updated**: Current Session
**Created For**: Complete System Verification Testing
