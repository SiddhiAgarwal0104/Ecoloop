# EcoLoop Unified Auth - Quick Reference

## 🚀 Quick Start

### Backend Endpoints

```
POST   /api/auth/signup          - Register user (household, ngo, recycler)
POST   /api/auth/login           - Login user (any role)
GET    /api/auth/profile         - Get current profile (authenticated)
POST   /api/auth/logout          - Logout (authenticated)
```

### Frontend Components

```jsx
// New unified components
<UnifiedLogin />      // Single login for all roles
<UnifiedRegister />   // Single signup for all roles
```

### Auth Context Usage

```jsx
import { useAuth } from '../../context/AuthContext';

const { login, register, user, token, logout } = useAuth();

// Signup
await register(
  name,
  email,
  password,
  passwordConfirm,
  phone,
  'recycler' // household, ngo, or recycler
);

// Login
const response = await login(
  email,
  password,
  'recycler' // Optional role hint
);
```

---

## 🔐 JWT Token Format

```json
{
  "id": "507f1f77bcf86cd799439011",
  "role": "RECYCLER",
  "iat": 1672531200,
  "exp": 1673136000
}
```

**Access token in localStorage**:
```javascript
localStorage.getItem('token')
localStorage.getItem('userRole')
```

---

## 🛡️ Middleware Usage

### Basic Authentication

```javascript
// Protect any route (requires valid token)
router.get('/protected', requireAuth, controllerFunction);
```

### Role-Based Access

```javascript
// Recycler only
router.get(
  '/recycler-only',
  requireAuth,
  requireRole('RECYCLER'),
  controllerFunction
);

// Multiple roles allowed
router.get(
  '/admin-or-ngo',
  requireAuth,
  requireRole(['ADMIN', 'NGO']),
  controllerFunction
);
```

### Specialized Auth

```javascript
// Recycler-specific (loads full profile)
router.get('/recycler-dashboard', recyclerAuth, dashboardController);

// NGO-specific (checks verified status)
router.get('/ngo-features', ngoAuth, ngoController);

// Household-specific
router.get('/household-features', householdAuth, householdController);
```

---

## 📋 Role Definitions

| Role | Model | Collection | Use Case |
|------|-------|-----------|----------|
| **HOUSEHOLD** | User | users | Individual waste donors |
| **NGO** | User | users | Organizations (needs verification) |
| **RECYCLER** | Recycler | recyclers | Waste processing professionals |
| **ADMIN** | User | users | System administrators |

---

## ✅ Response Formats

### Success Response (Login/Signup)

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "RECYCLER",
    "name": "John Recycler"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Invalid email or password",
  "statusCode": 401
}
```

---

## 🎯 Common Tasks

### Check if User is Authenticated

```jsx
const { user, token } = useAuth();

if (!token) {
  return <Navigate to="/login" />;
}
```

### Get User Role

```jsx
const { user } = useAuth();
const userRole = user?.role; // HOUSEHOLD, NGO, RECYCLER, ADMIN
```

### Conditional Rendering by Role

```jsx
const { user } = useAuth();

return (
  <>
    {user?.role === 'RECYCLER' && <RecyclerDashboard />}
    {user?.role === 'NGO' && <NGODashboard />}
    {user?.role === 'HOUSEHOLD' && <HouseholdDashboard />}
  </>
);
```

### Route Protection

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

// Usage
<ProtectedRoute requiredRole="RECYCLER">
  <RecyclerDashboard />
</ProtectedRoute>
```

---

## 🧪 Testing Requests

### Register Household

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@test.com",
    "password": "password123",
    "passwordConfirm": "password123",
    "role": "household"
  }'
```

### Register Recycler

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@test.com",
    "password": "password123",
    "passwordConfirm": "password123",
    "role": "recycler"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "password123",
    "role": "recycler"
  }'
```

### Protected Request

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚨 Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | Invalid input | Check required fields |
| 401 | Invalid credentials | Verify email/password |
| 401 | Token expired | Re-login |
| 401 | No token provided | Add Authorization header |
| 403 | Access denied | Check user role |
| 403 | NGO pending verification | Admin must verify |
| 409 | Email already registered | Use different email |
| 500 | Server error | Check backend logs |

---

## 📁 File Locations

### Backend Files

```
ecoloop-household-backend/
├── controllers/
│   └── unifiedAuthController.js       ← Main auth logic
├── middleware/
│   └── roleBasedAuth.js               ← Auth middleware
├── routes/
│   └── unifiedAuthRoutes.js           ← Auth routes
├── models/
│   ├── User.js                        ← Household/NGO model
│   └── Recycler.js                    ← Recycler model
├── utils/
│   └── generateToken.js               ← Token generation
└── server.js                          ← Route registration
```

### Frontend Files

```
ecoloop-household-frontend/src/
├── pages/
│   ├── UnifiedLogin.jsx               ← New login page
│   └── UnifiedRegister.jsx            ← New signup page
├── context/
│   └── AuthContext.jsx                ← Auth provider
└── App.jsx                            ← Route configuration
```

---

## ⚙️ Configuration

### Environment Variables

```env
# Backend
MONGODB_URI=mongodb://localhost:27017/ecoloop
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
PORT=5000

# Frontend (if needed)
VITE_API_URL=http://localhost:5000
```

---

## 🔄 Migration Path

### For Existing Users

```javascript
// Old endpoint still works
POST /api/recycler/auth/login

// New endpoint also works
POST /api/auth/login
```

### Frontend Migration

```jsx
// Old way (still works)
import Login from './pages/auth/Login';

// New way (recommended)
import UnifiedLogin from './pages/UnifiedLogin';
```

---

## 📊 Database

### User Collection Fields (Relevant to Auth)

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  role: String, // HOUSEHOLD, NGO, RECYCLER, ADMIN
  isVerified: Boolean, // false for NGO by default
  profileCompleted: Boolean,
  createdAt: Date,
  ...otherFields
}
```

### Recycler Collection Fields

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  phone: String,
  locality: String,
  latitude: Number,
  longitude: Number,
  ...statsFields
}
```

---

## 🎓 Development Tips

1. **Always send role in signup** - It determines which model to use
2. **Role in token is UPPERCASE** - RECYCLER, not recycler
3. **Recycler needs password** - Required field
4. **NGO needs verification** - Admin must approve before login
5. **Household skips profile requirement for recycler** - Direct dashboard access
6. **Token stored in localStorage** - Available across components

---

## 🆘 Debug Tips

### Check JWT Token

```javascript
// Decode without verification (frontend)
import jwt_decode from 'jwt-decode';
const decoded = jwt_decode(localStorage.getItem('token'));
console.log(decoded);
```

### Backend Logs to Watch

```
✅ User authenticated: ...      (Success)
❌ Invalid credentials          (Wrong password)
🔐 Processing recycler signup   (Role detected)
🚴 Recycler login success       (Recycler logged in)
⚠️ Role check failed: ...       (Authorization failed)
```

### Test Database Connection

```javascript
// In backend
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => console.log('✅ Connected'));
mongoose.connection.on('error', (err) => console.log('❌ Error:', err));
"
```

---

## 📞 Support Matrix

| Component | Stable | Testing | Not Ready |
|-----------|--------|---------|-----------|
| Household Auth | ✅ | - | - |
| NGO Auth | ✅ | Verification | - |
| Recycler Auth | ✅ | - | - |
| Token Management | ✅ | - | - |
| Role-Based Access | ✅ | - | - |
| Profile Completion | ✅ | - | - |
| Error Handling | ✅ | - | - |

---

**Last Updated**: January 2026
**Version**: 1.0
**Maintainer**: Development Team
