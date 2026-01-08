# ⚡ Admin Dashboard - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (Backend)
```bash
cd ecoloop-household-backend
npm install exceljs
```

### Step 2: Start the Backend
```bash
npm run dev
# Server runs on http://localhost:5000
```

### Step 3: Start the Frontend
```bash
cd ../ecoloop-household-frontend
npm run dev
# Frontend runs on http://localhost:5173 (or shown in terminal)
```

### Step 4: Access Admin Portal
```
URL: http://localhost:5173/admin/login
Email: admin@ecoloop.com
Password: admin123
```

---

## 📋 Test Scenarios

### Scenario 1: Verify an NGO

1. Login to admin portal
2. Click "NGO Verification" in sidebar
3. Find an NGO in the pending list
4. Click "Approve" button
5. ✅ NGO is now verified

### Scenario 2: View Dashboard Stats

1. Login to admin portal
2. You're on Dashboard page
3. See overview cards with:
   - Total Households
   - Total NGOs
   - Verified NGOs
   - Total Recyclers
   - Total Donations
4. Click "Review Now" to verify NGOs

### Scenario 3: Download Weekly Report

1. Click "Reports" in sidebar
2. Set "Days to Include" (e.g., 7)
3. Click "Download Weekly Report"
4. Excel file downloads:
   - `weekly_platform_activity_report_2026-01-06.xlsx`
5. Open in Excel/Sheets to view data

### Scenario 4: View Global Leaderboard

1. Click "Leaderboard" in sidebar
2. Global tab is selected
3. See ranked households by:
   - Donations given
   - Recycling actions
   - Total actions
   - Average rating
4. Click "Next" for more users

### Scenario 5: View Locality Leaderboard

1. Click "Leaderboard" in sidebar
2. Click "Locality Leaderboard" tab
3. Select locality from dropdown
4. See top households in that area

---

## 🗄️ File Structure

### Backend Files Added
```
ecoloop-household-backend/
├── models/
│   └── Admin.js                    ← New admin model
├── controllers/
│   └── adminController.js          ← All admin functions
├── routes/
│   └── adminRoutes.js              ← Admin API routes
├── middleware/
│   └── adminMiddleware.js          ← Auth & permissions
├── services/
│   └── reportService.js            ← Excel generation
└── server.js                        ← Updated with admin routes
```

### Frontend Files Added
```
ecoloop-household-frontend/
├── src/
│   ├── components/
│   │   └── admin/
│   │       ├── StatsCard.jsx       ← Stat card component
│   │       ├── AdminTable.jsx      ← Reusable table
│   │       ├── AdminSidebar.jsx    ← Navigation sidebar
│   │       └── AdminLayout.jsx     ← Admin page wrapper
│   ├── pages/
│   │   ├── AdminLogin.jsx          ← Login page
│   │   ├── AdminDashboard.jsx      ← Overview dashboard
│   │   ├── AdminNGOVerification.jsx ← NGO approval
│   │   ├── AdminDonations.jsx      ← Donations list
│   │   ├── AdminRecyclers.jsx      ← Recyclers list
│   │   ├── AdminLeaderboard.jsx    ← Leaderboards
│   │   └── AdminReports.jsx        ← Report downloads
│   └── App.jsx                      ← Updated with routes
```

---

## 🔑 Key Endpoints to Know

| Action | Method | Endpoint |
|--------|--------|----------|
| Login | POST | `/api/admin/login` |
| Get Pending NGOs | GET | `/api/admin/ngos/pending` |
| Approve NGO | PUT | `/api/admin/ngos/:id/approve` |
| Reject NGO | PUT | `/api/admin/ngos/:id/reject` |
| Platform Stats | GET | `/api/admin/stats/platform` |
| Donations List | GET | `/api/admin/donations` |
| Global Leaderboard | GET | `/api/admin/leaderboard/global` |
| Locality Leaderboard | GET | `/api/admin/leaderboard/locality/:area` |
| Download Weekly Report | GET | `/api/admin/reports/weekly` |

---

## 🛠️ Common Tasks

### How to Create Another Admin?

**Using API:**
```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin2@ecoloop.com",
    "password": "secure_password",
    "name": "Admin 2"
  }'
```

### How to Filter Donations?

1. Go to Admin → Donations
2. Use status dropdown: AVAILABLE, ACCEPTED, PICKED_UP, COMPLETED
3. Use search box for household name
4. Use pagination to navigate pages

### How to Generate Custom Reports?

1. Go to Admin → Reports
2. Select report type:
   - **Weekly Report:** Select days (1-90)
   - **Donation Report:** Select dates + status
   - **NGO Performance:** Auto-generated

### How to Reset a Password?

Currently: Direct MongoDB update
Future: Add password reset API

---

## 🐛 Troubleshooting

### Issue: Can't login to admin portal
**Solution:**
- Check email/password are correct
- Ensure admin user exists in database
- Check JWT_SECRET in .env is set
- Check backend server is running

### Issue: API returns 403 Forbidden
**Solution:**
- Verify you're logged in as ADMIN role
- Check your token is valid
- Use `/api/admin/login` not user login
- Make sure token is in Authorization header

### Issue: Reports won't download
**Solution:**
- Check exceljs is installed: `npm install exceljs`
- Restart backend server
- Check browser console for errors
- Ensure data exists in database

### Issue: Leaderboard shows no data
**Solution:**
- Create some donations/recycling actions first
- Check users have locality set
- Verify database has data
- Refresh page

### Issue: NGO Verification not working
**Solution:**
- Ensure NGO user exists with role='NGO'
- Check isVerified field in database
- Verify you're logged in as admin
- Check for error message in API response

---

## 📊 Sample Data Setup

To test properly, you need:

1. **At least one NGO:**
   - Sign up as NGO user
   - Complete profile
   - Will appear in pending list

2. **At least one Household:**
   - Sign up as household
   - Create a donation
   - Create recycling entry

3. **Then test admin:**
   - Login to admin
   - Verify the NGO
   - View stats and leaderboards

---

## 📱 Mobile Testing

Admin dashboard is fully responsive:
- ✅ Works on phones (375px+)
- ✅ Works on tablets (768px+)
- ✅ Works on desktops (1024px+)

Test by resizing browser or using DevTools

---

## 🔒 Security Notes

### For Development:
- Demo credentials are fine
- Using localStorage for tokens is OK
- Can test locally without HTTPS

### For Production:
- Change demo admin password
- Use environment variables for secrets
- Enable HTTPS
- Consider httpOnly cookies for tokens
- Add rate limiting to login
- Add CORS restrictions
- Enable admin account lockout

---

## 📈 Performance Tips

- Reports may take a few seconds for large datasets
- Pagination loads 10-20 items per page
- Search is case-insensitive
- Consider adding indexes for high-traffic tables

---

## ✅ Checklist Before Deployment

- [ ] Backend dependencies installed
- [ ] Database connected and working
- [ ] Admin user created
- [ ] Admin can login successfully
- [ ] Can verify NGO
- [ ] Can download reports
- [ ] Frontend pages load without errors
- [ ] Mobile responsiveness tested
- [ ] All routes working
- [ ] Error handling working
- [ ] Tested on production build

---

## 🆘 Getting Help

1. **Check logs:**
   ```bash
   # Backend terminal shows request logs
   # Frontend console shows errors (F12)
   ```

2. **Read documentation:**
   - `ADMIN_IMPLEMENTATION_GUIDE.md` - Detailed guide
   - `ADMIN_API_REFERENCE.md` - All endpoints
   - Code comments in files

3. **Debug with:**
   - Browser DevTools (F12)
   - Network tab to see API calls
   - MongoDB Compass to check data
   - Postman to test API directly

---

## 🚀 Next Steps

After getting started:

1. **Test all features:**
   - NGO verification workflow
   - Download all report types
   - Check all pages load

2. **Customize if needed:**
   - Change colors in design system
   - Add more stats to dashboard
   - Add new report types
   - Modify admin permissions

3. **Deploy:**
   - Deploy backend (Node.js server)
   - Deploy frontend (Vite build)
   - Set up database backups
   - Monitor performance

---

## 📞 Quick Reference

| Need | Location |
|------|----------|
| Admin login | `/admin/login` |
| Dashboard | `/admin/dashboard` |
| NGO verification | `/admin/ngos` |
| Donations | `/admin/donations` |
| Recyclers | `/admin/recyclers` |
| Leaderboard | `/admin/leaderboard` |
| Reports | `/admin/reports` |

---

**You're all set! 🎉**

Login to admin dashboard and start managing your platform!

---

**Quick Start Guide**
**Last Updated:** January 6, 2026
