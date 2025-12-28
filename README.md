# EcoLoop - Production-Ready Sustainability Platform

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Ports 3000 (frontend) and 5000 (backend) available

### Setup

1. **Backend Configuration**
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string (e.g., `openssl rand -hex 32`)
   - `FRONTEND_URL`: `http://localhost:3000` (dev) or your production URL

   ```bash
   npm install
   npm test        # Run tests to verify setup
   npm start       # Start server on port 5000
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start       # Starts on port 3000, proxies /api to localhost:5000
   ```

3. **Start Both (One Command)**
   - **macOS/Linux**: `./start-dev.sh`
   - **Windows**: `start-dev.bat`

## Features Implemented

### ✅ Authentication & Authorization
- Email/phone signup with role selection
- JWT-based auth with httpOnly cookies + Authorization header
- Role-based access control (RBAC) for:
  - Household: waste logging, item lending/donation
  - NGO: item requests, impact tracking
  - Recycler: material recovery, requests
  - Admin: system analytics and user management

### ✅ Household Features
- **Waste Logging**: Track daily waste by category with impact calculation
- **Image Upload**: Optional image upload for waste (AI prediction mock endpoint)
- **Item Lending**: Create reusable item listings (lend/donate)
- **Dashboard**: Real-time impact metrics and recent activity

### ✅ NGO & Recycler Features
- **Matched Items**: View locality-based available items
- **Requests**: Send/accept/reject item requests
- **Dashboard**: Pending requests and matched items
- **Notifications**: Real-time updates on request status changes

### ✅ Admin Dashboard
- **Analytics**: Aggregated waste data by category and time period
- **Community Impact**: Locality-based waste statistics
- **Metrics**: Total CO₂ saved, energy saved, landfill reduced

### ✅ Notifications
- Database-backed notification system
- Notifications on request creation, acceptance, and rejection
- Notification bell in topbar with unread count
- Mark-as-read functionality

### ✅ Backend Tests
All unit and integration tests pass:
- `tests/health.test.js`: Server startup and health check
- `tests/auth.test.js`: User signup and login
- `tests/rbac.test.js`: Role-based access control
- `tests/waste.test.js`: Waste logging and impact calculation
- `tests/admin.test.js`: Analytics aggregation
- `tests/notifications.test.js`: Request notifications
- `tests/requests_notifications.test.js`: Request flow and notifications

Run with: `npm test` from backend directory

## API Endpoints

### Authentication
- `POST /api/auth/register` - Signup
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Waste Logging (Household)
- `POST /api/waste/log` - Log waste (with optional image)
- `GET /api/waste/history` - Get waste history
- `GET /api/waste/dashboard` - Get dashboard stats
- `POST /api/waste/predict` - AI prediction for uploaded image

### Lend/Donate (Household)
- `POST /api/lend/create` - Create reusable item listing
- `GET /api/lend/browse` - Browse items in locality
- `GET /api/lend/matched` - Get matched items (NGO/Recycler only)
- `GET /api/lend/my-items` - Get user's own listings

### Requests (NGO/Recycler)
- `POST /api/requests/create` - Request an item
- `GET /api/requests/pending` - Get pending requests for owner
- `PUT /api/requests/:id/accept` - Accept a request
- `PUT /api/requests/:id/reject` - Reject a request
- `PUT /api/requests/:id/status` - Update request status

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

### Admin Analytics
- `GET /api/admin/analytics` - Get system-wide analytics (admin only)

## Tech Stack

**Frontend**
- React 18 with Hooks
- React Router v6 for navigation
- Axios for API calls
- Custom CSS with EcoLoop green theme
- Tailwind CSS ready (config provided)

**Backend**
- Node.js + Express.js
- MongoDB with Mongoose
- JWT authentication
- Multer for file uploads (cloud-ready with Cloudinary placeholder)
- Role-based middleware for authorization

## Testing

Run backend tests:
```bash
cd backend
npm test
```

Expected output: 10 tests across 7 suites, all passing.

## Verification Checklist

- [x] Backend starts on port 5000
- [x] Frontend proxies to backend successfully
- [x] Auth signup → login → dashboard works for all roles
- [x] Household waste logging creates entries with impact calculations
- [x] NGO/Recycler can view matched items and requests
- [x] Notifications appear on request events
- [x] Admin analytics aggregates waste data
- [x] All tests pass

## Known Limitations & Next Steps

1. **Image Storage**: Currently uses local disk. Cloudinary integration is scaffolded but requires API key.
2. **Real-time Updates**: Uses polling for notifications. WebSockets can be added for true real-time.
3. **AI Prediction**: Mock endpoint returns dummy data. Replace with actual ML model for production.
4. **Charts**: Admin dashboard shows raw JSON data. Add Recharts integration for visual charts.
5. **Email Notifications**: Optional. Can be added via Nodemailer or SendGrid.

## Production Checklist

Before deploying:
- [ ] Set strong `JWT_SECRET` in production
- [ ] Configure CORS for production domain
- [ ] Set `NODE_ENV=production`
- [ ] Use cloud MongoDB (Atlas) instead of local
- [ ] Enable HTTPS/TLS
- [ ] Configure Cloudinary for image uploads
- [ ] Add rate limiting middleware
- [ ] Enable request validation and sanitization
- [ ] Set up error monitoring (Sentry)
- [ ] Configure database backups
- [ ] Run security audit (OWASP)

## Support

For issues or questions:
1. Check error logs: `backend/` and frontend console
2. Verify MongoDB connection: `MONGODB_URI` in `.env`
3. Ensure ports 3000 and 5000 are free
4. Run `npm test` to verify backend health
