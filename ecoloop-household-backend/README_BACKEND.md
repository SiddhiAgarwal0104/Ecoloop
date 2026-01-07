# EcoLoop Recycler Backend API

Production-grade REST API for the EcoLoop Recycler module. Built with Node.js, Express, MongoDB, and JWT authentication.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Development](#development)

## ✨ Features

### Core Functionality
- **User Authentication**: Register, login, password management
- **Profile Management**: Update profile, upload profile images
- **Request Management**: Discover, accept, and track recycle requests
- **Location-Based Services**: Find nearby requests using geolocation
- **Dashboard Analytics**: View performance metrics and statistics
- **Rating & Reviews**: Receive ratings from household users

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: Bcryptjs password hashing
- **Request Validation**: Comprehensive input validation
- **CORS Protection**: Configurable cross-origin requests
- **Error Handling**: Structured error responses with appropriate HTTP status codes

### Performance Features
- **Database Indexing**: Optimized Mongoose schemas with compound indices
- **Pagination**: Large result sets pagination
- **Lean Queries**: Efficient MongoDB queries returning plain objects
- **Connection Pooling**: MongoDB connection pooling (5-10 connections)

## 🛠 Tech Stack

### Backend Framework
- **Express.js** - Web framework
- **Node.js** - Runtime environment

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB

### Authentication & Security
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing

### File Uploads
- **Cloudinary** - Cloud image hosting
- **Multer** - File upload middleware

### Utilities
- **axios** - HTTP client for inter-service communication
- **dotenv** - Environment variable management
- **CORS** - Cross-Origin Resource Sharing

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance
- Cloudinary account (for image uploads)

### Setup Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Create .env File**
```bash
cp .env.example .env
```

3. **Configure Environment Variables**
```env
# Server
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecoloop-recycler

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend
CORS_ORIGIN=http://localhost:5173

# Household Backend
HOUSEHOLD_API_URL=http://localhost:5000
INTER_SERVICE_TOKEN=your_inter_service_token

# Optional
LOG_LEVEL=debug
```

4. **Start Server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📋 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment | `development` \| `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/db` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `CLOUDINARY_NAME` | Cloudinary account name | `your-account` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your-api-key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:5173` |
| `HOUSEHOLD_API_URL` | Household backend URL | `http://localhost:5000` |

## 🔌 API Endpoints

### Authentication Endpoints

#### Register
```http
POST /api/recycler/auth/register
Content-Type: application/json

{
  "email": "recycler@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "name": "John Recycler",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "recycler@example.com",
    "name": "John Recycler",
    "phone": "+1234567890",
    "totalRequests": 0,
    "completedRequests": 0,
    "completionRate": 0,
    "totalWasteCollected": 0
  }
}
```

#### Login
```http
POST /api/recycler/auth/login
Content-Type: application/json

{
  "email": "recycler@example.com",
  "password": "SecurePass123"
}
```

#### Get Profile
```http
GET /api/recycler/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/recycler/auth/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Updated Name",
  "phone": "+9876543210",
  "address": "123 Main St",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "bio": "Professional recycler",
  "profileImage": <file>
}
```

#### Change Password
```http
PUT /api/recycler/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123",
  "confirmPassword": "NewPass123"
}
```

### Request Management Endpoints

#### Get Available Requests
```http
GET /api/recycler/requests/available?page=1&limit=10
```

#### Get Nearby Requests
```http
GET /api/recycler/requests/nearby?latitude=40.7128&longitude=-74.0060&radius=5
```

#### Accept Request
```http
POST /api/recycler/requests/:requestId/accept
Authorization: Bearer <token>
```

#### Get My Requests
```http
GET /api/recycler/requests/my-requests?status=ACCEPTED
Authorization: Bearer <token>
```

#### Update Request Status
```http
PUT /api/recycler/requests/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "PICKED_UP"  // or "RECYCLED"
}
```

#### Get Request Details
```http
GET /api/recycler/requests/:id
Authorization: Bearer <token>
```

### Dashboard Endpoints

#### Get Dashboard
```http
GET /api/recycler/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "name": "John Recycler",
      "email": "recycler@example.com",
      "phone": "+1234567890",
      "profileImage": "https://...",
      "bio": "..."
    },
    "stats": {
      "totalRequests": 15,
      "completedRequests": 12,
      "completionRate": 80,
      "totalWasteCollected": 250.5,
      "rating": 4.5,
      "reviewCount": 10
    },
    "requests": {
      "accepted": 2,
      "pickedUp": 1,
      "recycled": 12
    },
    "recentRequests": [...],
    "wasteByCategory": [...]
  }
}
```

#### Get Performance Metrics
```http
GET /api/recycler/dashboard/performance?period=month
Authorization: Bearer <token>
```

#### Get Statistics
```http
GET /api/recycler/dashboard/statistics
Authorization: Bearer <token>
```

## 📁 Project Structure

```
ecoloop-recycler-backend/
├── config/                          # Configuration files
│   ├── db.js                       # MongoDB connection
│   └── cloudinary.js               # Cloudinary setup
├── controllers/                     # Route handlers
│   ├── recyclerAuthController.js   # Authentication logic
│   ├── recyclerRequestController.js # Request management
│   └── recyclerDashboardController.js # Dashboard & analytics
├── middleware/                      # Express middleware
│   ├── authMiddleware.js           # JWT verification
│   └── uploadMiddleware.js         # File upload handling
├── models/                          # Mongoose schemas
│   ├── Recycler.js                 # Recycler user schema
│   ├── RequestAcceptance.js        # Request tracking
│   └── RecyclerReview.js           # Rating & reviews
├── routes/                          # API routes
│   ├── recyclerAuthRoutes.js       # Auth endpoints
│   ├── recyclerRequestRoutes.js    # Request endpoints
│   └── recyclerDashboardRoutes.js  # Dashboard endpoints
├── utils/                           # Utility functions
│   ├── appError.js                 # Custom error class
│   ├── generateToken.js            # JWT token generation
│   ├── distanceCalculator.js       # Geolocation utilities
│   └── cloudinaryUpload.js         # Cloud upload helpers
├── server.js                        # Server entry point
├── .env.example                     # Environment template
├── package.json                     # Dependencies
└── README.md                        # Documentation
```

## 🔐 Authentication

### JWT Token Flow

1. **Registration/Login**: User credentials exchanged for JWT token
2. **Token Storage**: Client stores token in localStorage/sessionStorage
3. **Token Usage**: Token sent in Authorization header for protected routes
4. **Token Verification**: Middleware verifies token on each request
5. **Token Refresh**: Expired tokens require re-authentication

### Protected Routes

All routes requiring authentication must include:
```http
Authorization: Bearer <jwt_token>
```

### Token Claims
```json
{
  "id": "user_id",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## ⚠️ Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input/validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate email/request |
| 500 | Server Error | Internal server error |

### Common Errors

**Invalid Token**
```json
{
  "success": false,
  "message": "Token has expired",
  "statusCode": 401
}
```

**Validation Error**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters",
  "statusCode": 400
}
```

**Not Found**
```json
{
  "success": false,
  "message": "Recycler not found",
  "statusCode": 404
}
```

## 🔧 Development

### Available Scripts

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Run tests (when available)
npm test

# Lint code
npm run lint
```

### Code Quality Standards

- **Comments**: JSDoc for all functions
- **Validation**: Input validation on all endpoints
- **Error Handling**: Try-catch blocks with specific error types
- **Logging**: Console logs with emoji indicators
- **Database**: Indexed queries for performance

### Debugging

Enable debug logs:
```bash
NODE_ENV=development npm run dev
```

The server will log:
- ✅ Successful operations
- ❌ Errors with stack traces
- ⚠️ Warnings
- 📥 Incoming requests
- 📤 File uploads
- 📍 Location updates
- 🔌 Database connections

## 📞 Support

For issues or questions, contact the development team or open an issue in the repository.

## 📄 License

This project is part of the EcoLoop ecosystem. All rights reserved.
