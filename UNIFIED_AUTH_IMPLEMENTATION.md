# EcoLoop Unified Role-Based Auth System - Implementation Guide

## Overview

This document describes the unified role-based authentication system implemented for EcoLoop with support for three distinct user roles:
- **Household**: Individual users who want to donate/recycle waste
- **NGO**: Organizations that collect donations and manage sustainability programs
- **Recycler**: Professionals/businesses that process waste and provide recycling services

## Architecture

### 1. Backend Structure

#### Core Files Created

**File**: `controllers/unifiedAuthController.js`
- Central authentication controller handling all three roles
- Contains: `signup()`, `login()`, `getProfile()`, `logout()`
- Internally delegates role-specific logic to appropriate models

**File**: `middleware/roleBasedAuth.js`
- Enhanced authentication and authorization middleware
- Contains:
  - `requireAuth()` - Basic JWT verification with role extraction
  - `requireRole(roles)` - Role-based access control
  - `recyclerAuth()` - Recycler-specific auth with profile loading
  - `ngoAuth()` - NGO-specific auth with verification check
  - `householdAuth()` - Household-specific auth
  - `adminAuth()` - Admin auth (backward compatible)

**File**: `routes/unifiedAuthRoutes.js`
- Central auth routes for all three roles
- Routes:
  - `POST /api/auth/signup` - Register user
  - `POST /api/auth/login` - Login user
  - `GET /api/auth/profile` - Get current user profile
  - `POST /api/auth/logout` - Logout user

**File**: `utils/generateToken.js` (Updated)
- Already supports role in JWT payload
- Signature: `generateToken(id, role, expiresIn)`
- JWT contains: `{ id, role, iat, exp }`

#### Database Models

**User Model** (`models/User.js`)
- Stores household and NGO users
- Fields:
  - `role`: HOUSEHOLD | NGO | RECYCLER | ADMIN
  - `isVerified`: Boolean (NGOs start unverified)
  - `profileCompleted`: Boolean

**Recycler Model** (`models/Recycler.js`)
- Separate collection for recycler-specific data
- Includes: location, statistics, ratings, reviews
- Integrated with household/NGO requests

### 2. Authentication Flow

#### Signup Flow

```
POST /api/auth/signup
{
  "name": "John Recycler",
  "email": "john@recycler.com",
  "password": "password123",
  "passwordConfirm": "password123",
  "phone": "9876543210",
  "role": "recycler"  // household | ngo | recycler
}

UNIFIED LOGIC:
├─ Validate inputs (email, password, role)
├─ If role === 'recycler':
│  └─ Create Recycler document
│     └─ Generate token with role='RECYCLER'
│
└─ If role === 'household' or 'ngo':
   └─ Create User document with appropriate role
      └─ Generate token with role='HOUSEHOLD' or 'NGO'

RESPONSE:
{
  "success": true,
  "token": "eyJ...",
  "user": { _id, email, role, ... },
  "message": "Registration successful"
}
```

#### Login Flow

```
POST /api/auth/login
{
  "email": "john@recycler.com",
  "password": "password123",
  "role": "recycler"  // Optional, for optimization
}

UNIFIED LOGIC:
├─ If role === 'recycler' or detected as recycler:
│  └─ Query Recycler model
│     └─ Verify password
│        └─ Generate token with role='RECYCLER'
│
└─ If role === 'household' or 'ngo':
   └─ Query User model
      └─ Verify password
      └─ Check if NGO is verified (if applicable)
         └─ Generate token with appropriate role

RESPONSE:
{
  "success": true,
  "token": "eyJ...",
  "user": { _id, email, role, profileCompleted, ... },
  "message": "Login successful"
}
```

#### Protected Route Access

```
GET /api/protected
Header: Authorization: Bearer eyJ...

MIDDLEWARE: requireAuth
├─ Extract token from header
├─ Verify JWT signature
├─ Decode token → { id, role, ... }
├─ Attach to req.user: { id, role }
└─ Next middleware/controller

MIDDLEWARE: requireRole(['RECYCLER'])
├─ Check req.user.role
├─ If NOT in allowed roles → 403 Forbidden
└─ Otherwise → Allow access
```

### 3. Token Structure

**JWT Payload Format**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "role": "RECYCLER",
  "iat": 1672531200,
  "exp": 1673136000
}
```

**Token Validity**: 7 days (configurable via `JWT_EXPIRE`)

### 4. Role-Based Access Control

#### Middleware Usage Examples

**Recycler-only route**:
```javascript
router.get(
  '/dashboard',
  requireAuth,
  requireRole('RECYCLER'),
  recyclerDashboardController
);
```

**NGO or Admin only**:
```javascript
router.put(
  '/verify/:ngoId',
  requireAuth,
  requireRole(['NGO', 'ADMIN']),
  ngoVerificationController
);
```

**Any authenticated user**:
```javascript
router.get(
  '/profile',
  requireAuth,
  getProfileController
);
```

#### Existing Routes - No Changes

- NGO routes remain under `/api/ngo` with existing middleware
- Household/donation routes remain under `/api/donations`
- Badge routes, leaderboard, etc. are untouched
- Admin routes remain under `/api/admin` with `adminAuth` middleware

## Frontend Integration

### 1. Context Updates

**File**: `context/AuthContext.jsx` (Updated)

The `register()` function now accepts:
```javascript
register(name, email, password, passwordConfirm, phone, role)
```

The `login()` function now accepts:
```javascript
login(email, password, role)
```

Both functions now:
- Call `/api/auth/signup` and `/api/auth/login` (unified endpoints)
- Store role in localStorage
- Handle profile completion redirects

### 2. New UI Components

**File**: `pages/UnifiedLogin.jsx` (NEW)
- Single login interface with role selector
- Features:
  - Three role buttons: Household, NGO, Recycler
  - Email and password inputs
  - Error handling with user feedback
  - Role-based dashboard routing after login

**File**: `pages/UnifiedRegister.jsx` (NEW)
- Single registration interface with role selector
- Features:
  - Role selection with descriptions
  - Name, email, phone, password fields
  - Password confirmation
  - Automatic routing to profile completion (Household/NGO) or dashboard (Recycler)

### 3. Post-Login Routing

After successful login, users are redirected based on role:

```javascript
if (userRole === 'NGO') {
  navigate('/ngo/dashboard');
} else if (userRole === 'RECYCLER') {
  navigate('/recycler/dashboard');
} else {
  navigate('/dashboard'); // Household
}
```

### 4. Profile Completion

After signup or first login:
- **Household & NGO**: Redirected to `/profile/complete` to add location, details
- **Recycler**: Goes directly to `/recycler/dashboard`

## API Endpoints Summary

### Public Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Register new user (any role) |
| POST | `/api/auth/login` | Login user (any role) |

### Protected Endpoints

| Method | Endpoint | Auth Required | Roles Allowed |
|--------|----------|---------------|---------------|
| GET | `/api/auth/profile` | Yes | Any authenticated |
| POST | `/api/auth/logout` | Yes | Any authenticated |
| GET | `/api/recycler/auth/profile` | Yes | RECYCLER |
| PUT | `/api/recycler/auth/profile` | Yes | RECYCLER |
| GET | `/api/ngo/*` | Yes | NGO (verified) |
| GET | `/api/donations/*` | Yes | HOUSEHOLD, NGO |
| GET | `/api/admin/*` | Yes | ADMIN |

## Migration Guide

### For Existing Household/NGO Users

**No changes required** - Existing login/signup flow remains functional:
- Old endpoints still work via legacy routes
- Role field in User model already exists
- Middleware is backward compatible

### For Recycler Users

**Optional migration**:
- Existing recycler-specific routes continue to work
- Can start using unified `/api/auth` endpoints
- Token format includes role (already implemented)

### For Frontend Development

1. Replace old Login/Register with UnifiedLogin/UnifiedRegister
2. Update routes in App.jsx to use new components
3. Update AuthContext to use new function signatures
4. Test all three role flows

## Testing Checklist

### Backend Testing

```bash
# Test Household signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Household",
    "email": "household@test.com",
    "password": "password123",
    "passwordConfirm": "password123",
    "role": "household"
  }'

# Test NGO signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test NGO",
    "email": "ngo@test.com",
    "password": "password123",
    "passwordConfirm": "password123",
    "role": "ngo"
  }'

# Test Recycler signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Recycler",
    "email": "recycler@test.com",
    "password": "password123",
    "passwordConfirm": "password123",
    "role": "recycler"
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recycler@test.com",
    "password": "password123",
    "role": "recycler"
  }'

# Test protected route
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN_HERE"
```

### Frontend Testing

1. **Household Role**:
   - Sign up as household
   - Login redirects to household dashboard
   - Can access household-specific features

2. **NGO Role**:
   - Sign up as NGO
   - Login redirects to NGO dashboard
   - Cannot access until verified by admin

3. **Recycler Role**:
   - Sign up as recycler
   - Login redirects to recycler dashboard
   - Can immediately access recycler features

4. **Error Cases**:
   - Invalid credentials → 401
   - Missing role → 400
   - Unverified NGO login → 403
   - Expired token → 401 (new login required)

## Deployment Notes

### Environment Variables Required

```
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
NODE_ENV=production
```

### Database Migrations

No migrations required - existing data structures are compatible.

### API Versioning

- New endpoints use `/api/auth/` prefix
- Legacy endpoints remain unchanged
- Both work simultaneously during transition period

## Troubleshooting

### Issue: Token doesn't contain role

**Solution**: Ensure using `generateToken(id, role)` with role parameter in controller.

### Issue: NGO can't login after signup

**Solution**: NGO must be verified by admin first. Check:
1. `User.isVerified` = false initially
2. Admin must set `isVerified` = true
3. Only then can NGO login

### Issue: Mixed role detection

**Solution**: Always include role in login request. If role is auto-detected incorrectly:
```javascript
// Always provide role
login(email, password, 'recycler') // Explicit role
```

### Issue: Recycler password not being verified

**Solution**: Recycler model password is marked `select: false`. Use:
```javascript
const recycler = await Recycler.findOne({ email }).select('+password');
```

## File Changes Summary

### New Files Created
- `controllers/unifiedAuthController.js`
- `middleware/roleBasedAuth.js`
- `routes/unifiedAuthRoutes.js`
- `pages/UnifiedLogin.jsx`
- `pages/UnifiedRegister.jsx`

### Files Modified
- `server.js` - Route registration and merge conflict resolution
- `context/AuthContext.jsx` - Updated login/register function signatures
- `utils/generateToken.js` - Already supported role (no changes needed)

### Files NOT Modified (Preserved)
- `controllers/authController.js` - Household/NGO auth (legacy)
- `controllers/recyclerAuthController.js` - Recycler legacy endpoints
- `routes/ngoRoutes.js`
- `routes/recycleRoutes.js`
- `models/User.js`
- `models/Recycler.js`
- All donation, badge, and NGO-specific controllers

## Next Steps

1. **Backend**:
   - Deploy unified auth routes
   - Test all three role flows
   - Monitor logs for auth issues

2. **Frontend**:
   - Update routing to use UnifiedLogin/UnifiedRegister
   - Update AuthContext integration
   - Test login/signup for each role

3. **Monitoring**:
   - Watch JWT token generation
   - Monitor role-based access patterns
   - Track profile completion rates per role

## Support & Documentation

For questions about:
- **Role-based access**: See middleware/roleBasedAuth.js documentation
- **Token format**: See utils/generateToken.js
- **Database models**: See models/User.js and models/Recycler.js
- **Frontend integration**: See context/AuthContext.jsx

---

**Version**: 2.0.0
**Last Updated**: January 2026
**Status**: Production Ready
