# EcoLoop Recycler Frontend - Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd ecoloop-recycler-frontend
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_APP_NAME=EcoLoop Recycler
```

### Step 3: Start Development Server
```bash
npm run dev
```

Open browser: `http://localhost:5173`

## 10-Minute Testing Flow

### 1. User Registration
- Navigate to `/register`
- Fill registration form:
  - Name: John Recycler
  - Email: john@example.com
  - Phone: +1234567890
  - Password: SecurePass123!
  - Confirm: SecurePass123!
- Click "Register"
- Auto-redirects to login

### 2. User Login
- Navigate to `/login` (or auto-redirected from register)
- Email: john@example.com
- Password: SecurePass123!
- Click "Login"
- Redirects to dashboard

### 3. Complete Profile
- Auto-redirected to `/complete-profile`
- Upload profile image (optional)
- Add bio/description
- Enable location access (for geolocation)
- Click "Complete Profile"
- Redirects to dashboard

### 4. View Dashboard
- See statistics grid (requests, completed, etc.)
- View waste categories chart
- See recent requests table
- Check performance metrics

### 5. Browse Requests
- Click "Available Requests" in sidebar
- See all recycling requests
- Use proximity filter (1-50km range)
- View distance to each request
- Click "Accept" to accept request

### 6. Manage Requests
- Click "My Requests" in sidebar
- Filter by status (Accepted, Picked Up, Recycled)
- View request cards
- Click to view details
- Update status as you complete work

### 7. Check Notifications
- Click "Notifications" in sidebar
- Filter notifications (All/Unread/Read)
- Click "Mark as read" to dismiss
- Click "Delete" to remove

### 8. Update Profile
- Click user icon in navbar (top right)
- Click "Profile"
- Edit any field
- Click "Save Changes"
- See updated profile information

## Project Commands

```bash
# Development
npm run dev           # Start dev server (port 5173)

# Production
npm run build         # Build for production
npm run preview       # Preview production build

# Code Quality
npm run lint          # Check code style (if configured)
```

## Component Quick Reference

### Page Components
```javascript
import { Dashboard, Profile, MyRecycles, MyDonations, Notifications } from './pages';

// Routes automatically set up in App.jsx
// Dashboard: /dashboard
// Profile: /profile
// Complete Profile: /complete-profile
// My Requests: /my-requests
// Available Requests: /requests
// Notifications: /notifications
```

### UI Components
```javascript
import { Card, Button, Input, Modal, Alert, Badge, Select, Textarea, LoadingSpinner } from './components/UI';

// Usage examples provided in README_FRONTEND.md
```

### Custom Hooks
```javascript
import { useAuth, useForm, useApi, useRecyclerLocation } from './hooks';

// useAuth - Get current user and auth methods
// useForm - Handle form state and validation
// useApi - Make API requests with loading/error states
// useRecyclerLocation - Get geolocation data
```

## API Integration Examples

### Get User Profile
```javascript
import axios from './api/axios';

try {
  const response = await axios.get('/auth/profile');
  console.log('Profile:', response.data);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Accept a Request
```javascript
try {
  const response = await axios.post(`/requests/${requestId}/accept`);
  console.log('Request accepted:', response.data);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Nearby Requests
```javascript
try {
  const response = await axios.get('/requests/nearby', {
    params: {
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 5
    }
  });
  console.log('Nearby requests:', response.data);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Common Issues & Solutions

### Issue: "Cannot GET /"
**Solution:** App.jsx routing redirects `/` to `/dashboard`. This is correct.

### Issue: "CORS Error"
**Solution:** Check backend is running on port 5001. Verify `VITE_API_BASE_URL` in `.env.local`.

### Issue: "Invalid Token"
**Solution:** Token expired. Logout (clears localStorage) and login again.

### Issue: Images Not Uploading
**Solution:** Check Cloudinary configuration. Verify file size < 5MB. Check network tab for errors.

### Issue: Geolocation Not Working
**Solution:** Allow location permission in browser. Check HTTPS (required in production).

## File Locations Quick Ref

| Component | Location |
|-----------|----------|
| Dashboard page | `src/pages/Dashboard.jsx` |
| Login page | `src/pages/auth/Login.jsx` |
| UI Button | `src/components/UI/Button.jsx` |
| Auth context | `src/context/RecyclerAuthContext.jsx` |
| useAuth hook | `src/hooks/index.js` |
| API axios | `src/api/axios.js` |
| Config | `src/config/config.js` |
| Constants | `src/config/constants.js` |

## Environment Variables

```env
# Backend API URL (required)
VITE_API_BASE_URL=http://localhost:5001/api

# App name (optional)
VITE_APP_NAME=EcoLoop Recycler

# Add more as needed for your setup
```

## Browser DevTools Tips

1. **React DevTools**
   - Install React DevTools extension
   - Inspect components in Components tab
   - View props and state

2. **Network Tab**
   - Check API request/response
   - Verify status codes (200, 401, 500)
   - Check response headers for errors

3. **Console**
   - Look for console errors
   - Check emoji indicators (✅, ❌, ⚠️)
   - View API request logging

4. **Application Tab**
   - Check localStorage for JWT token
   - Clear cache if having stale data issues

## Production Deployment

### Build Production Bundle
```bash
npm run build
```

Outputs to `dist/` folder.

### Deploy to Vercel
```bash
npm install -g vercel
vercel deploy
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Environment Variables for Production
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME=EcoLoop Recycler
```

## Next Steps

1. ✅ Start dev server (`npm run dev`)
2. ✅ Test registration and login flow
3. ✅ Test API integration (check Network tab)
4. ✅ Try form submissions with error handling
5. ✅ Test responsive design (open DevTools mobile view)
6. ✅ Review component code for patterns
7. ✅ Add features as needed
8. ✅ Test on production build (`npm run build && npm run preview`)

## Support Resources

- **Frontend Docs:** [README_FRONTEND.md](./README_FRONTEND.md)
- **Implementation Summary:** [FRONTEND_IMPLEMENTATION_SUMMARY.md](./FRONTEND_IMPLEMENTATION_SUMMARY.md)
- **Backend Docs:** Check backend README
- **Component Examples:** Review `src/pages/` for implementation patterns
- **Tailwind CSS:** https://tailwindcss.com/docs
- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev

## Key Features Checklist

Frontend includes:
- ✅ Authentication (login/register)
- ✅ Dashboard with statistics
- ✅ Request browsing and filtering
- ✅ Geolocation and proximity search
- ✅ Request acceptance and tracking
- ✅ User profile management
- ✅ Notification system
- ✅ Responsive mobile design
- ✅ Error handling and validation
- ✅ Loading states
- ✅ Image uploads (Cloudinary)
- ✅ Real-time status updates (polling ready)

Enjoy! 🎉
