# EcoLoop Unified Auth - Validation & Testing Guide

## Quick Validation Checklist

### ✅ Backend Setup Validation

- [ ] `controllers/unifiedAuthController.js` created
- [ ] `middleware/roleBasedAuth.js` created
- [ ] `routes/unifiedAuthRoutes.js` created
- [ ] `server.js` updated with unified routes
- [ ] No merge conflicts in server.js
- [ ] Environment variables set (`JWT_SECRET`, `MONGODB_URI`)
- [ ] All route imports resolve without errors

### ✅ Frontend Setup Validation

- [ ] `pages/UnifiedLogin.jsx` created
- [ ] `pages/UnifiedRegister.jsx` created
- [ ] `context/AuthContext.jsx` updated
- [ ] Login/Register function signatures updated
- [ ] No merge conflicts in AuthContext
- [ ] Role selector UI displays correctly

### ✅ Database Validation

- [ ] MongoDB connection working
- [ ] Recycler collection accessible
- [ ] User collection accessible
- [ ] Both models have password hashing

---

## Test Scenarios

### Scenario 1: Household User Registration & Login

**Setup**: Fresh household user account

**Test Steps**:
```
1. Navigate to /register
2. Select "🏠 Household" role
3. Fill form:
   - Name: John Household
   - Email: household@test.com
   - Password: password123
   - Confirm: password123
4. Click "Create Account"
```

**Expected Results**:
- ✅ Form validates (no empty fields)
- ✅ Passwords match validation passes
- ✅ Backend creates User with role='HOUSEHOLD'
- ✅ JWT token generated with role='HOUSEHOLD'
- ✅ Redirected to `/profile/complete`
- ✅ Profile completion required

**Verification**:
```javascript
// Check JWT payload
const token = localStorage.getItem('token');
const decoded = jwt_decode(token);
console.log(decoded); // Should have { id, role: 'HOUSEHOLD', ... }
```

**Login Test**:
```
1. Navigate to /login
2. Select "🏠 Household" role
3. Enter credentials
4. Click "Login"
```

**Expected Results**:
- ✅ Login succeeds
- ✅ Redirected to `/dashboard`
- ✅ Household features accessible

---

### Scenario 2: NGO User Registration & Login

**Setup**: Fresh NGO account

**Test Steps**:
```
1. Navigate to /register
2. Select "🏢 NGO" role
3. Fill form:
   - Name: Test NGO
   - Email: ngo@test.com
   - Password: password123
   - Confirm: password123
4. Click "Create Account"
```

**Expected Results**:
- ✅ Backend creates User with role='NGO'
- ✅ isVerified=false initially
- ✅ JWT token generated with role='NGO'
- ✅ Redirected to `/profile/complete`

**Verification**:
```javascript
// MongoDB check
db.users.findOne({ email: 'ngo@test.com' })
// Should show: role: 'NGO', isVerified: false
```

**Login Test (Before Verification)**:
```
1. Try to login with NGO credentials
```

**Expected Results**:
- ✅ Error message: "Your NGO is pending admin verification..."
- ✅ Cannot access NGO dashboard

**Admin Verification**:
```javascript
// Admin verifies NGO
db.users.updateOne(
  { email: 'ngo@test.com' },
  { $set: { isVerified: true } }
);
```

**Login Test (After Verification)**:
```
1. Navigate to /login
2. Select "🏢 NGO" role
3. Enter credentials
4. Click "Login"
```

**Expected Results**:
- ✅ Login succeeds
- ✅ Redirected to `/ngo/dashboard`
- ✅ NGO features accessible

---

### Scenario 3: Recycler User Registration & Login

**Setup**: Fresh recycler account

**Test Steps**:
```
1. Navigate to /register
2. Select "🚴 Recycler" role
3. Fill form:
   - Name: John Recycler
   - Email: recycler@test.com
   - Password: password123
   - Confirm: password123
4. Click "Create Account"
```

**Expected Results**:
- ✅ Backend creates Recycler document
- ✅ JWT token generated with role='RECYCLER'
- ✅ Redirected directly to `/recycler/dashboard`
- ✅ No profile completion required

**Verification**:
```javascript
// Check JWT payload
const decoded = jwt_decode(token);
console.log(decoded.role); // Should be 'RECYCLER'

// Check MongoDB
db.recyclers.findOne({ email: 'recycler@test.com' })
// Should exist with password field
```

**Login Test**:
```
1. Navigate to /login
2. Select "🚴 Recycler" role
3. Enter credentials
4. Click "Login"
```

**Expected Results**:
- ✅ Login succeeds
- ✅ Redirected to `/recycler/dashboard`
- ✅ Recycler features accessible

---

### Scenario 4: Authentication Error Handling

#### Test 4a: Invalid Credentials

**Test Steps**:
```
1. Navigate to /login
2. Select any role
3. Enter:
   - Email: valid@test.com
   - Password: wrongpassword
4. Click "Login"
```

**Expected Results**:
- ✅ Error message: "Invalid email or password"
- ✅ Not redirected
- ✅ Token NOT stored
- ✅ User remains on login page

#### Test 4b: Missing Fields

**Test Steps**:
```
1. Navigate to /register
2. Leave Name empty
3. Click "Create Account"
```

**Expected Results**:
- ✅ Error message: "Name is required"
- ✅ Form not submitted

#### Test 4c: Password Mismatch

**Test Steps**:
```
1. Navigate to /register
2. Password: password123
3. Confirm: password456
4. Click "Create Account"
```

**Expected Results**:
- ✅ Error message: "Passwords do not match"
- ✅ Form not submitted

#### Test 4d: Email Already Exists

**Test Steps**:
```
1. Register: household@test.com
2. Try to register again with same email
3. Different role
```

**Expected Results**:
- ✅ Error message: "Email already registered"
- ✅ Account not created
- ✅ HTTP 409 Conflict

---

### Scenario 5: Role-Based Access Control

#### Test 5a: Recycler Accessing Household Route

**Test Steps**:
```
1. Login as recycler
2. Try to access /api/donations (household route)
```

**Expected Results**:
- ✅ Request blocked
- ✅ 403 Forbidden response
- ✅ Error: "Access denied. Required role(s): HOUSEHOLD"

#### Test 5b: Household Accessing Recycler Dashboard

**Test Steps**:
```
1. Login as household
2. Try to access /recycler/dashboard
```

**Expected Results**:
- ✅ Access denied
- ✅ Redirected to household dashboard
- ✅ OR 403 Forbidden if using API

#### Test 5c: NGO Accessing Admin Routes

**Test Steps**:
```
1. Login as verified NGO
2. Try to access /api/admin/users
```

**Expected Results**:
- ✅ Request blocked
- ✅ 403 Forbidden response

---

### Scenario 6: Token Management

#### Test 6a: Token Expiration

**Test Steps**:
```
1. Get valid token
2. Modify JWT_EXPIRE to 1 second
3. Wait 2 seconds
4. Try to access protected route
```

**Expected Results**:
- ✅ Error: "Token has expired"
- ✅ 401 Unauthorized
- ✅ User redirected to login

#### Test 6b: Invalid Token

**Test Steps**:
```
1. Get valid token
2. Modify token: remove last character
3. Try to access protected route
```

**Expected Results**:
- ✅ Error: "Invalid token"
- ✅ 401 Unauthorized

#### Test 6c: Missing Token

**Test Steps**:
```
1. Try to access protected route without token
2. Check Authorization header
```

**Expected Results**:
- ✅ Error: "No authorization token provided"
- ✅ 401 Unauthorized

---

### Scenario 7: Profile Completion

#### Test 7a: Household Profile Completion

**Test Steps**:
```
1. Register as household
2. Redirect to /profile/complete
3. Fill profile:
   - Address
   - Locality
   - Pincode
4. Submit
```

**Expected Results**:
- ✅ Profile updated in database
- ✅ profileCompleted = true
- ✅ Redirected to dashboard
- ✅ No longer prompted to complete profile

#### Test 7b: NGO Profile Completion

**Test Steps**:
```
1. Register as NGO
2. Admin verifies NGO
3. Login
4. Complete profile
```

**Expected Results**:
- ✅ NGO can now access all features
- ✅ Can access /ngo/dashboard

---

### Scenario 8: Cross-Role Login

#### Test 8a: Email Registered as Multiple Roles

**Test Steps**:
```
1. Register email as Household
2. Try to register same email as Recycler
```

**Expected Results**:
- ✅ Error: "Email already registered"
- ✅ HTTP 409 Conflict
- ✅ Cannot have same email in multiple models

---

## Manual API Testing

### Using cURL

**Register Household**:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Household",
    "email": "household@test.com",
    "password": "password123",
    "passwordConfirm": "password123",
    "phone": "9876543210",
    "role": "household"
  }'
```

**Register Recycler**:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Recycler",
    "email": "recycler@test.com",
    "password": "password123",
    "passwordConfirm": "password123",
    "phone": "9876543210",
    "role": "recycler"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recycler@test.com",
    "password": "password123",
    "role": "recycler"
  }'
```

**Protected Route**:
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Using Postman

### Collection Setup

1. Create new collection: "EcoLoop Auth Tests"
2. Add environment variable:
   ```
   base_url: http://localhost:5000
   token: (auto-populated after login)
   ```

### Requests

**Signup (Household)**:
```
POST {{base_url}}/api/auth/signup
Body (JSON):
{
  "name": "John Household",
  "email": "household@test.com",
  "password": "password123",
  "passwordConfirm": "password123",
  "role": "household"
}
```

**Login**:
```
POST {{base_url}}/api/auth/login
Body (JSON):
{
  "email": "household@test.com",
  "password": "password123",
  "role": "household"
}

Tests (after request):
pm.environment.set("token", pm.response.json().token);
```

**Get Profile**:
```
GET {{base_url}}/api/auth/profile
Headers:
Authorization: Bearer {{token}}
```

---

## Performance Considerations

### Response Time Targets

- Signup: < 500ms
- Login: < 300ms
- Token verification: < 50ms
- Profile fetch: < 100ms

### Database Indexes Required

```javascript
// User collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Recycler collection
db.recyclers.createIndex({ email: 1 }, { unique: true });
db.recyclers.createIndex({ locality: 1 });
```

---

## Debugging Tips

### Check JWT Token Contents

```javascript
// In browser console
const token = localStorage.getItem('token');
const decoded = jwt_decode(token);
console.log(decoded);
```

### Monitor Backend Logs

Look for these patterns:
- `✅ User authenticated: ...` - Success
- `❌ Token verification error: ...` - Token issue
- `🔐 Processing X auth` - Which role being processed
- `⚠️ Role check failed: ...` - Authorization issue

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "No token provided" | Authorization header missing | Include `Authorization: Bearer TOKEN` |
| "Invalid token" | Token corrupted | Re-login to get new token |
| "Email already registered" | Duplicate email | Use unique email or check database |
| "Invalid credentials" | Wrong password | Verify email/password match |
| "NGO pending verification" | NGO not verified by admin | Admin must approve NGO |
| CORS error | Frontend/backend domain mismatch | Check CORS_ORIGIN env var |
| 500 error | Server error | Check backend logs for details |

---

## Sign-Off Checklist

After completing all tests, verify:

- [ ] All three roles can signup
- [ ] All three roles can login
- [ ] JWT token contains role field
- [ ] Role-based access control works
- [ ] Error messages are user-friendly
- [ ] No console errors on frontend
- [ ] No merge conflicts in code
- [ ] Database indexes created
- [ ] Environment variables configured
- [ ] Profile completion flow works
- [ ] NGO verification requirement enforced
- [ ] Token expiration works
- [ ] Logout clears token

---

## Rollback Plan

If issues occur:

1. **Frontend Issues**: Revert to old Login.jsx/Register.jsx
2. **Backend Issues**: Keep old auth routes at `/api/recycler/auth` as fallback
3. **Database Issues**: No data loss - all models unchanged
4. **Token Issues**: Users can re-login for new token

---

**Version**: 1.0.0
**Last Updated**: January 2026
