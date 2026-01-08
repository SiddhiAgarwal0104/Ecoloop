# EcoLoop Unified Auth - Deployment & Transition Guide

## 📋 Pre-Deployment Preparation

### 1. Environment Setup

Ensure all environment variables are configured:

```bash
# Backend (.env file)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecoloop
JWT_SECRET=your-very-secret-key-generate-this
JWT_EXPIRE=7d
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
PORT=5000

# Frontend (.env.local file)
VITE_API_URL=https://api.yourdomain.com
```

### 2. Database Preparation

Create necessary indexes in MongoDB:

```javascript
// Connect to MongoDB and run
use ecoloop

// User collection indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isVerified: 1 });

// Recycler collection indexes
db.recyclers.createIndex({ email: 1 }, { unique: true });
db.recyclers.createIndex({ locality: 1 });
db.recyclers.createIndex({ createdAt: -1 });
```

### 3. Backup Current State

```bash
# Backup MongoDB
mongodump --out backup_$(date +%Y%m%d_%H%M%S)

# Backup application files
tar -czf ecoloop_backup_$(date +%Y%m%d_%H%M%S).tar.gz .
```

---

## 🚀 Deployment Steps

### Phase 1: Backend Deployment (30 minutes)

#### Step 1.1: Update Backend Code

```bash
cd ecoloop-household-backend

# Copy new files
cp controllers/unifiedAuthController.js.backup controllers/unifiedAuthController.js
cp middleware/roleBasedAuth.js.backup middleware/roleBasedAuth.js
cp routes/unifiedAuthRoutes.js.backup routes/unifiedAuthRoutes.js

# Update server.js
# (Merge conflict already resolved in provided files)

# Install any missing dependencies
npm install
```

#### Step 1.2: Test Backend Locally

```bash
# Start development server
npm start

# In another terminal, test endpoints
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "passwordConfirm": "password123",
    "role": "household"
  }'

# Expected: 201 Created with token
```

#### Step 1.3: Deploy to Production

```bash
# Build for production
npm run build

# Stop current server
pm2 stop ecoloop-backend

# Update production code
cp -r dist/* /var/www/ecoloop/

# Start server
pm2 start ecosystem.config.js --name ecoloop-backend

# Verify server health
curl http://localhost:5000/health
```

#### Step 1.4: Monitor Backend

```bash
# Check logs
pm2 logs ecoloop-backend

# Watch for errors
watch -n 1 'pm2 logs ecoloop-backend | tail -20'
```

**Rollback Command**: `pm2 stop ecoloop-backend && pm2 revert`

---

### Phase 2: Frontend Deployment (20 minutes)

#### Step 2.1: Update Frontend Code

```bash
cd ecoloop-household-frontend

# Update pages
cp pages/UnifiedLogin.jsx.backup pages/UnifiedLogin.jsx
cp pages/UnifiedRegister.jsx.backup pages/UnifiedRegister.jsx

# Update context
# (AuthContext.jsx already updated in provided files)

# Install dependencies
npm install
```

#### Step 2.2: Update Routing

In your `App.jsx` or routing file:

```jsx
// OLD CODE (can be kept as backup)
// import Login from './pages/auth/Login';
// import Register from './pages/auth/Register';

// NEW CODE
import UnifiedLogin from './pages/UnifiedLogin';
import UnifiedRegister from './pages/UnifiedRegister';

// Update routes
{
  path: '/login',
  element: <UnifiedLogin />
},
{
  path: '/register',
  element: <UnifiedRegister />
}
```

#### Step 2.3: Build Frontend

```bash
# Production build
npm run build

# Test build locally
npm run preview
```

#### Step 2.4: Deploy to CDN/Server

```bash
# Deploy to static hosting (e.g., Netlify, Vercel, S3)
npm run deploy

# OR manually
aws s3 sync dist/ s3://your-bucket/ecoloop/ --delete

# Invalidate CDN cache
aws cloudfront create-invalidation --distribution-id XXXXX --paths '/*'
```

#### Step 2.5: Verify Frontend

- Open https://yourdomain.com/login
- Verify role selector appears
- Test email/password input
- Try signing up (won't complete without backend running)

**Rollback Command**: `npm run deploy:previous-version`

---

## 🔄 Gradual Rollout Strategy

### Option 1: Big Bang (Immediate) - Recommended for this case

**Pros**: Immediate benefits, simpler coordination
**Cons**: All users affected at once

```
Time: 00:00 → Backend deployment
Time: 00:15 → Frontend deployment
Time: 00:30 → Monitor and support
```

### Option 2: Canary Deployment (Gradual)

**For larger user base**:

```
Week 1: 10% of traffic to new auth
Week 2: 50% of traffic
Week 3: 100% of traffic
```

### Option 3: Feature Flag

```javascript
// In frontend config
const USE_UNIFIED_AUTH = process.env.VITE_USE_UNIFIED_AUTH === 'true';

if (USE_UNIFIED_AUTH) {
  <UnifiedLogin />
} else {
  <Login /> // Old component
}
```

---

## ✅ Verification Checklist

After deployment, verify all functionality:

### Backend Verification

```bash
# ✅ Health check
curl http://localhost:5000/health

# ✅ Household signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{...}' # See UNIFIED_AUTH_QUICK_REFERENCE.md

# ✅ Household login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{...}'

# ✅ Recycler signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Recycler",
    "email": "recycler@test.com",
    "password": "password123",
    "passwordConfirm": "password123",
    "role": "recycler"
  }'

# ✅ NGO signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test NGO",
    "email": "ngo@test.com",
    "password": "password123",
    "passwordConfirm": "password123",
    "role": "ngo"
  }'

# ✅ Protected route (with token)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Verification

- [ ] Navigate to /login
- [ ] Verify three role buttons appear
- [ ] Click each button - color changes
- [ ] Navigate to /register
- [ ] Verify role selector appears
- [ ] Fill form with household credentials
- [ ] Submit - should redirect to profile/complete or dashboard
- [ ] Logout
- [ ] Repeat with recycler role
- [ ] Verify recycler redirects to /recycler/dashboard
- [ ] Check localStorage for token and userRole
- [ ] Open DevTools - check JWT payload

### Integration Verification

- [ ] Household can access donation features
- [ ] Recycler can access recycler dashboard
- [ ] NGO can access NGO features (after verification)
- [ ] Notifications work for all roles
- [ ] Badges appear correctly
- [ ] Leaderboard displays
- [ ] Socket.IO connections work
- [ ] Error messages display correctly

---

## 📊 Post-Deployment Monitoring

### Metrics to Watch

```javascript
// Key metrics for first 24 hours
1. Authentication success rate (target: >95%)
2. Login error rate (target: <5%)
3. New user signup rate
4. Role distribution (household:ngo:recycler ratio)
5. NGO verification requests
6. Average login time (target: <1 second)
7. Token verification errors
8. Profile completion rate
```

### Log Monitoring

```bash
# Watch for auth errors
tail -f logs/auth.log | grep "ERROR"

# Watch role-based access
tail -f logs/auth.log | grep "Role check"

# Watch login attempts
tail -f logs/auth.log | grep "login"
```

### Alert Thresholds

- Auth failure rate > 10% → Alert
- Login time > 2 seconds → Alert
- Token errors > 5/minute → Alert
- Specific role signup stops → Alert

---

## 🆘 Troubleshooting During Deployment

### Issue: "Cannot find module" error

**Solution**:
```bash
npm install
npm ci --production
```

### Issue: Token not generated

**Check**:
```javascript
// Verify JWT_SECRET is set
echo $JWT_SECRET

// Verify generateToken is working
node -e "const { generateToken } = require('./utils/generateToken'); console.log(generateToken('test-id', 'RECYCLER'))"
```

### Issue: Role not in token

**Check** in unifiedAuthController.js:
```javascript
// Ensure you're calling:
const token = generateToken(recycler._id, 'RECYCLER'); // Role included
// NOT:
const token = generateToken(recycler._id); // Role defaults to RECYCLER
```

### Issue: Middleware error

**Check** server.js:
```javascript
// Ensure route order is correct - protected routes after middleware
app.use('/api/auth', unifiedAuthRoutes); // Must be early
app.use(errorHandler); // Must be last
```

### Issue: CORS errors

**Check** environment:
```bash
# Verify CORS_ORIGIN includes frontend domain
echo $CORS_ORIGIN

# Should include your frontend URL
# Correct: http://localhost:5173,https://yourdomain.com
```

### Issue: Database connection fails

```bash
# Test MongoDB connection
mongosh $MONGODB_URI

# Check if indexes exist
db.users.getIndexes()
```

---

## 📝 Rollback Procedure

### If Critical Issue Found (Within 1 Hour)

```bash
# Backend rollback
cd /var/www/ecoloop
git revert HEAD
npm install
pm2 restart ecoloop-backend

# Frontend rollback
cd /var/www/ecoloop-frontend
git revert HEAD
npm run build && npm run deploy
```

### If Database Issue

```bash
# Restore from backup
mongorestore backup_20240107_120000/
```

### If Need to Keep Old Auth Working

Both old and new endpoints work:
- Old: `POST /api/recycler/auth/login`
- New: `POST /api/auth/login`

Direct users back to old flow temporarily while investigating.

---

## 🎓 User Communication

### Email to Send Before Deployment

```
Subject: System Maintenance - Updated Login Experience

Dear EcoLoop Users,

We're improving your login experience with a unified authentication system!

What's changing:
✅ Single login page for all users (household, NGO, recycler)
✅ Faster, more secure authentication
✅ Better role management
✅ Same features, same access

What stays the same:
✅ Your account and data
✅ All your features (donations, requests, etc.)
✅ Your rewards and badges
✅ NGO verification process

Scheduled Maintenance:
📅 Date: January 15, 2024
⏰ Time: 2:00 AM - 2:30 AM UTC
⏱️ Duration: ~30 minutes

Your access will be temporarily unavailable during this time.

Need help?
📧 Support: support@ecoloop.com
📱 Chat: In-app support chat
🌐 Status: status.ecoloop.com

Thank you for your patience!
EcoLoop Team
```

### Post-Deployment Announcement

```
Subject: ✅ New Unified Login Now Live!

Hi [User],

Your EcoLoop login experience is now faster and more intuitive!

🎯 New Features:
- Select your role before logging in
- Cleaner, more modern interface
- Better error messages
- Faster authentication

🔐 Security:
- Enhanced JWT tokens
- Role-based access control
- Better protection for your account

Getting started:
1. Go to login.ecoloop.com
2. Select your role (Household, NGO, or Recycler)
3. Enter your credentials
4. That's it!

Your old password still works. No action needed from you.

Questions?
📧 support@ecoloop.com
```

---

## 📈 Success Criteria

### After 1 Hour
- ✅ No critical errors
- ✅ All endpoints responding
- ✅ Users can signup and login
- ✅ Redirects work correctly

### After 24 Hours
- ✅ Auth success rate > 95%
- ✅ No sustained errors
- ✅ Users positive feedback
- ✅ All roles working
- ✅ Performance stable

### After 1 Week
- ✅ All old users migrated
- ✅ New signup pattern established
- ✅ NGO verification process stable
- ✅ No rollback needed
- ✅ Full confidence in system

---

## 🎯 Final Checklist

### Before Deployment
- [ ] All code reviewed
- [ ] Tests passed
- [ ] Environment variables set
- [ ] Database indexes created
- [ ] Backups created
- [ ] Team notified
- [ ] Support team trained
- [ ] Rollback procedure tested

### During Deployment
- [ ] Backend deployed and tested
- [ ] Frontend deployed and tested
- [ ] Monitoring active
- [ ] Team on standby
- [ ] Support tickets monitored

### After Deployment
- [ ] All verification checks passed
- [ ] Users able to signup/login
- [ ] No critical errors
- [ ] Performance acceptable
- [ ] Team debriefing completed

---

## 📞 Support Contacts

**During Deployment**:
- Backend Lead: [Contact]
- Frontend Lead: [Contact]
- DevOps: [Contact]
- On-call Support: [Phone/Slack]

**Escalation Path**:
1. Backend/Frontend teams (immediate)
2. DevOps team (15 min)
3. Product Manager (30 min)
4. CEO/CTO (if needed)

---

## 📚 Related Documentation

- UNIFIED_AUTH_IMPLEMENTATION.md - Full technical guide
- UNIFIED_AUTH_TESTING.md - Testing procedures
- UNIFIED_AUTH_QUICK_REFERENCE.md - Developer reference
- UNIFIED_AUTH_CHANGES_SUMMARY.md - What changed
- Original merge documentation - For context

---

**Version**: 1.0
**Last Updated**: January 2026
**Status**: Ready for Deployment
**Estimated Time**: 1-2 hours for full deployment
**Risk Level**: Low (backward compatible, clear rollback path)
