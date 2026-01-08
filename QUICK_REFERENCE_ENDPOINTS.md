# 🎯 Quick Reference Card - All Routes & Endpoints

## Frontend Endpoints (All use base URL: http://localhost:5000/api)

### Authentication
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/register` | POST | ❌ | Register household/NGO |
| `/auth/login` | POST | ❌ | Login household/NGO |
| `/recycler/auth/register` | POST | ❌ | Register recycler |
| `/recycler/auth/login` | POST | ❌ | Login recycler |
| `/admin/login` | POST | ❌ | Admin login |

### Admin Routes (Must use adminToken)
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/admin/stats/platform` | GET | 🔐 ADMIN | Get dashboard stats |
| `/admin/ngos/pending` | GET | 🔐 ADMIN | View pending NGOs |
| `/admin/ngos/verified` | GET | 🔐 ADMIN | View verified NGOs |
| `/admin/ngos/:ngoId/approve` | PUT | 🔐 ADMIN | Approve NGO |
| `/admin/recyclers/pending` | GET | 🔐 ADMIN | View pending recyclers |
| `/admin/recyclers/verified` | GET | 🔐 ADMIN | View verified recyclers |
| `/admin/recyclers/:recyclerId/approve` | PUT | 🔐 ADMIN | Approve recycler |

### Recycler Routes
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/recycler/requests/available` | GET | ❌ | View available requests |
| `/recycler/requests/nearby` | GET | ❌ | View nearby requests |
| `/recycler/requests/:requestId/accept` | POST | 🔐 | Accept request |
| `/recycler/requests/my-requests` | GET | 🔐 | View accepted requests ⚠️ MUST come before `/:id` |
| `/recycler/requests/:id/complete` | PUT | 🔐 | Mark as complete |
| `/recycler/requests/:id` | GET | 🔐 | Get request details ⚠️ MUST be LAST |

### Notification Routes
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/notifications` | GET | 🔐 | Get user notifications (any role) |
| `/notifications/:id/read` | PATCH | 🔐 | Mark as read |
| `/notifications/:id` | DELETE | 🔐 | Delete notification |

### Badge Routes
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/badges` | GET | 🔐 | Get all badges |
| `/badges/my` | GET | 🔐 | Get user's badges ⚠️ MUST come before `/:id` |
| `/badges/:id` | GET | 🔐 | Get badge details ⚠️ MUST be LAST |

### Recycle Routes
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/recycle/create` | POST | 🔐 | Create recycle request |
| `/recycle` | GET | 🔐 | Get user's recycles |
| `/recycle/:id` | GET | 🔐 | Get recycle details |

### Donation Routes
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/donations/create` | POST | 🔐 | Create donation |
| `/donations` | GET | 🔐 | Get donations |
| `/donations/:id` | GET | 🔐 | Get donation details |

**Legend:**
- ❌ No auth required
- 🔐 Requires token (role varies)
- 🔐 ADMIN = Admin token only
- 🔐 = Regular user token (HOUSEHOLD/RECYCLER/NGO/ADMIN)
- ⚠️ = Critical route ordering issue

---

## Authentication Headers

### Regular Users
```
Authorization: Bearer <token>
```
Where token is from:
- localStorage.token (from unified login)
- localStorage.recycler_token (from recycler login)

### Admin Users
```
Authorization: Bearer <adminToken>
```
Where adminToken is from:
- localStorage.adminToken (from admin login)

---

## Critical Route Ordering Rules

### ✅ Correct Order (Specific BEFORE Generic)
```
router.get('/my-requests', handler);      // Specific
router.get('/nearby', handler);            // Specific
router.get('/:id', handler);               // Generic (last!)
```

### ❌ WRONG Order (Generic BEFORE Specific)
```
router.get('/:id', handler);               // Generic catches everything!
router.get('/my-requests', handler);       // Never reached!
```

### Routes That Need Careful Ordering:
1. **`/recycler/requests`** - `/my-requests` BEFORE `/:id`
2. **`/badges`** - `/my` BEFORE `/:id`
3. **Any with `:id` parameter** - Put specific routes first

---

## Response Structure Examples

### Admin Stats Response (GET /api/admin/stats/platform)
```json
{
  "success": true,
  "data": {
    "city": "Gorakhpur",
    "users": {
      "totalHouseholds": 5,
      "totalNGOs": 2,
      "verifiedNGOs": 1,
      "totalRecyclers": 3
    },
    "donations": {
      "total": 10,
      "completed": 7,
      "pending": 3
    },
    "recycling": {
      "total": 8,
      "completed": 5,
      "pending": 3
    }
  }
}
```

### Notification List (GET /api/notifications)
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "recyclerId": null,
      "type": "REQUEST_ACCEPTED",
      "title": "Request Accepted",
      "message": "A recycler accepted your request",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Recycler's Requests (GET /api/recycler/requests/my-requests)
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "wasteCategory": "PLASTIC",
      "quantity": 2.5,
      "unit": "KG",
      "status": "ACCEPTED",
      "pickupLocation": {
        "address": "123 Main St",
        "latitude": 26.7605,
        "longitude": 75.3863
      },
      "images": ["https://res.cloudinary.com/..."],
      "acceptedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Error Response (All endpoints)
```json
{
  "success": false,
  "message": "Error description",
  "status": 400  // or 401, 403, 404, 500
}
```

---

## HTTP Status Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | Success | ✅ Working correctly |
| 201 | Created | ✅ Resource created successfully |
| 400 | Bad Request | Check data format, admin profile complete |
| 401 | Unauthorized | Missing/invalid token, token expired |
| 403 | Forbidden | Wrong role, insufficient permissions |
| 404 | Not Found | Wrong route, typo in endpoint, or catch-all route issue |
| 500 | Server Error | Check backend logs, database connection |

---

## Environment Variables Checklist

```env
# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Optional
NODE_ENV=development
PORT=5000
```

---

## Frontend Token Storage

### For Regular Users
```javascript
localStorage.setItem('token', jwtToken);
localStorage.setItem('user', JSON.stringify(userData));
```

### For Recyclers
```javascript
localStorage.setItem('recycler_token', jwtToken);
localStorage.setItem('recycler_user', JSON.stringify(userData));
```

### For Admin
```javascript
localStorage.setItem('adminToken', jwtToken);
localStorage.setItem('adminUser', JSON.stringify(userData));
```

### Getting Token for Requests
```javascript
const token = localStorage.getItem('token') || 
              localStorage.getItem('recycler_token') ||
              localStorage.getItem('adminToken');

// In axios config:
headers: { Authorization: `Bearer ${token}` }
```

---

## Console Logs to Monitor

### Backend Logs
```
📊 [Admin Stats] Fetching stats for city:        → Admin dashboard loading
👥 [Admin Stats] User counts:                     → User statistics
🎁 [Admin Stats] Donation stats:                  → Donation statistics
♻️ [Admin Stats] Recycling stats:                 → Recycling statistics
✅ [Admin Stats] Stats calculated successfully    → Success
❌ [Admin Stats] Error:                           → Error occurred
🔔 [Notification] Created notification            → Notification created
📬 Fetching notifications for HOUSEHOLD/RECYCLER → Notification fetch
```

### Frontend Logs
```
📡 [AdminDashboard] Fetching platform stats      → Admin dashboard fetch
✅ [AdminDashboard] Platform stats fetched       → Success
❌ [AdminDashboard] Error fetching stats         → Error
📬 Fetching notifications for HOUSEHOLD/RECYCLER → Notification fetch
✅ Found X notifications                          → Success
📤 PUT /recycler/requests/.../complete           → Mark complete request
✅ Request marked as complete                    → Success
```

---

## Troubleshooting Quick Guide

### Issue: Admin Dashboard is Blank
**Check:**
1. Browser console for logs starting with `📡`
2. Is adminToken in localStorage? (F12 → Application → Storage)
3. Is admin user.role === 'ADMIN'? (check user document)
4. Does admin have complete profile with city field?

**Solution:** Verify admin profile completion

---

### Issue: /my-requests Returns Error
**Check:**
1. URL is exactly `/api/recycler/requests/my-requests`
2. Route order: `/my-requests` comes BEFORE `/:id` in routes file
3. User is authenticated (recycler_token exists)

**Solution:** Check recyclerRequestRoutes.js for route ordering

---

### Issue: Notifications Not Showing
**Check:**
1. Endpoint is `/api/notifications` (not `/recycler/notifications`)
2. User token in localStorage
3. Browser console: `📬 Fetching notifications...` logs appear
4. Network tab: request returns 200 (not 401/403)

**Solution:** Remove role restriction from notificationRoutes.js

---

### Issue: 401 Unauthorized
**Likely Cause:** Invalid or missing token

**Check:**
1. Token exists in localStorage for your role
2. Token not expired
3. Token format: "Bearer ..." with space between

**Solution:** Login again to refresh token

---

### Issue: 403 Forbidden
**Likely Cause:** Wrong role or missing permission

**Check:**
1. User role matches endpoint requirement
2. Admin user has required permission flag
3. Role field populated in User document

**Solution:** Verify user role in database

---

### Issue: 404 Not Found
**Likely Cause:** Route ordering or typo

**Check:**
1. Exact endpoint URL spelling
2. Route order: specific before catch-all
3. Middleware applied correctly

**Solution:** Use curl or Postman to test exact URL

---

## Testing Command Examples

### Get Admin Stats (with curl)
```bash
curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
     http://localhost:5000/api/admin/stats/platform
```

### Get Recycler's Requests (with curl)
```bash
curl -H "Authorization: Bearer <RECYCLER_TOKEN>" \
     http://localhost:5000/api/recycler/requests/my-requests
```

### Get Notifications (with curl)
```bash
curl -H "Authorization: Bearer <ANY_TOKEN>" \
     http://localhost:5000/api/notifications
```

### Accept Recycler Request
```bash
curl -X POST \
     -H "Authorization: Bearer <RECYCLER_TOKEN>" \
     http://localhost:5000/api/recycler/requests/<REQUEST_ID>/accept
```

### Mark Request Complete
```bash
curl -X PUT \
     -H "Authorization: Bearer <RECYCLER_TOKEN>" \
     http://localhost:5000/api/recycler/requests/<REQUEST_ID>/complete
```

---

## Key Files Reference

| File | Purpose | Critical Section |
|------|---------|------------------|
| `server.js` | Route mounting | Lines 45-100 (app.use calls) |
| `routes/adminRoutes.js` | Admin endpoints | All defined here |
| `routes/recyclerRequestRoutes.js` | Recycler requests | **Line 50-66 (route order!)** |
| `routes/notificationRoutes.js` | Notifications | **Line 16-17 (role restriction removed!)** |
| `routes/badgeRoutes.js` | Badge endpoints | **Lines 13-22 (route order)** |
| `controllers/adminController.js` | Admin logic | Lines 524-610 (getPlatformStats) |
| `controllers/notificationController.js` | Notification logic | Lines 9-31 (getMyNotifications) |
| `middleware/adminMiddleware.js` | Admin auth | Lines 8-49 (adminAuth function) |
| `models/Recycle.js` | Recycle schema | Status enum, timestamps |
| `models/Notification.js` | Notification schema | userId, recyclerId fields |

---

## Session Fixes Summary

### Fix 1: recyclerRequestRoutes.js
- **Line**: Route definitions
- **Change**: Moved `/my-requests` before catch-all `/:id`
- **Impact**: Now `/api/recycler/requests/my-requests` works

### Fix 2: notificationRoutes.js
- **Line**: 16-17
- **Change**: Removed `restrictTo('RECYCLER')`
- **Impact**: All roles can fetch notifications

---

**Last Updated:** Current Session
**For:** Complete System Verification
**Status:** ✅ All Verified & Documented
