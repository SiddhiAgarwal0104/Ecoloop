# EcoLoop Household Backend

A comprehensive Node.js/Express backend API for the EcoLoop sustainability platform, enabling households to manage donations and recycling activities with location-based tracking and community engagement features.

## 🚀 Features

- **User Authentication**: JWT-based secure authentication with password hashing
- **Donation Management**: Complete CRUD for donation tracking with multi-image upload
- **Recycle Tracking**: Manage waste recycling requests with category classification
- **Location-Based Services**: GPS coordinates for pickup locations
- **Dashboard Analytics**: Real-time statistics and activity tracking
- **Notification System**: User notifications with read/unread status
- **Role-Based Access Control**: HOUSEHOLD user role restrictions
- **Image Handling**: Multi-file upload support with Cloudinary integration
- **Error Handling**: Global error management with proper HTTP status codes

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB 7.6.3 (Atlas)
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Security**: bcryptjs 2.4.3
- **File Upload**: Multer 1.4.5-lts.1
- **Image Storage**: Cloudinary 1.41.0
- **CORS**: cors 2.8.5
- **Environment**: dotenv 16.3.1
- **Development**: nodemon 3.0.1

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account (for image uploads)

## ⚙️ Installation

1. **Clone the repository**
```bash
cd ecoloop-household-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecoloop
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

5. **Setup MongoDB Atlas**
   - Create account at mongodb.com
   - Create a cluster
   - Add your IP to network access whitelist
   - Create database user credentials
   - Get connection string

6. **Setup Cloudinary (Optional)**
   - Create account at cloudinary.com
   - Get API credentials from dashboard

## 🚀 Running the Server

**Development Mode** (with auto-reload)
```bash
npm run dev
```

**Production Mode**
```bash
npm start
```

Server will run on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "phone": "9876543210",
  "locality": "Bandra",
  "address": "123 Main Street",
  "latitude": 19.0596,
  "longitude": 72.8295
}

Response: 201 Created
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password@123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Get Profile
```
GET /auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### Donation Endpoints

#### Create Donation
```
POST /donations
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- itemCategory: CLOTHES (enum: CLOTHES, FOOD, BOOKS, ELECTRONICS, FURNITURE, TOYS, OTHER)
- condition: GOOD (enum: NEW, LIKE_NEW, GOOD, FAIR, USED)
- quantity: 5
- description: Optional description
- address: Required address
- latitude: Required latitude
- longitude: Required longitude
- images: Optional (max 5 files)

Response: 201 Created
```

#### Get My Donations
```
GET /donations/my
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "count": 5,
  "data": {
    "donations": [ ... ]
  }
}
```

#### Get Single Donation
```
GET /donations/:id
Authorization: Bearer {token}
```

#### Update Donation
```
PUT /donations/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "itemCategory": "FOOD",
  "quantity": 10,
  "condition": "FAIR",
  "description": "Updated description"
}
```

#### Delete Donation
```
DELETE /donations/:id
Authorization: Bearer {token}
```

### Recycle Endpoints

#### Create Recycle Request
```
POST /recycle
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- wasteCategory: PLASTIC (enum: PLASTIC, PAPER, METAL, GLASS, E_WASTE, ORGANIC, MIXED)
- wasteType: SEGREGATED (enum: SEGREGATED, MIXED)
- quantity: 25
- unit: KG (enum: KG, ITEMS, BAGS)
- description: Optional
- address: Required
- latitude: Required
- longitude: Required
- images: Optional (max 5 files)

Response: 201 Created
```

#### Get My Recycle Requests
```
GET /recycle/my
Authorization: Bearer {token}
```

#### Get Single Recycle Request
```
GET /recycle/:id
Authorization: Bearer {token}
```

#### Update Recycle Request
```
PUT /recycle/:id
Authorization: Bearer {token}

{
  "wasteCategory": "PAPER",
  "quantity": 30,
  "unit": "KG",
  "description": "Updated waste"
}
```

#### Delete Recycle Request
```
DELETE /recycle/:id
Authorization: Bearer {token}
```

### Dashboard Endpoints

#### Get Household Dashboard
```
GET /dashboard/household
Authorization: Bearer {token}

Response includes:
- Recent donations and recycles
- Total counts
- Active vs completed
- Status breakdown
- Quick actions
```

#### Get Statistics
```
GET /dashboard/stats
Authorization: Bearer {token}

Response includes:
- Donation statistics
- Recycle statistics
- Status-wise breakdown
```

### Notification Endpoints

#### Get Notifications
```
GET /notifications?page=1&limit=20&unreadOnly=false
Authorization: Bearer {token}

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- unreadOnly: Show unread only (true/false)
```

#### Get Unread Count
```
GET /notifications/unread-count
Authorization: Bearer {token}
```

#### Mark as Read
```
PUT /notifications/:id/read
Authorization: Bearer {token}
```

#### Mark All as Read
```
PUT /notifications/read-all
Authorization: Bearer {token}
```

#### Delete Notification
```
DELETE /notifications/:id
Authorization: Bearer {token}
```

### System Endpoints

#### Health Check
```
GET /api/health

Response: 200 OK
{
  "status": "success",
  "message": "EcoLoop Household Backend is running"
}
```

## 📁 Project Structure

```
ecoloop-household-backend/
├── config/
│   ├── db.js                 # MongoDB connection
│   └── cloudinary.js         # Cloudinary config
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── donationController.js # Donation operations
│   ├── recycleController.js  # Recycle operations
│   ├── dashboardController.js# Dashboard logic
│   └── notificationController.js # Notifications
├── middleware/
│   ├── authMiddleware.js     # JWT & role check
│   ├── uploadMiddleware.js   # File upload
│   └── errorHandler.js       # Error handling
├── models/
│   ├── User.js               # User schema
│   ├── Donation.js           # Donation schema
│   ├── Recycle.js            # Recycle schema
│   └── Notification.js       # Notification schema
├── routes/
│   ├── authRoutes.js
│   ├── donationRoutes.js
│   ├── recycleRoutes.js
│   ├── dashboardRoutes.js
│   └── notificationRoutes.js
├── utils/
│   ├── appError.js           # Custom error class
│   ├── generateToken.js      # JWT generator
│   ├── cloudinaryUpload.js   # Image upload helper
│   └── notificationHelper.js # Notification helper
├── server.js                 # Entry point
├── package.json
├── .env.example
├── API_TESTING_GUIDE.md      # API testing reference
├── TESTING_REPORT.md         # Testing report
└── README.md
```

## 🔐 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: HOUSEHOLD role restrictions
- **CORS**: Cross-origin resource sharing enabled
- **Error Handling**: Proper error messages without stack traces in production
- **Environment Variables**: Sensitive data in .env
- **Input Validation**: Request validation at route level

## 🧪 Testing

### Run Test Suite
```bash
node test-api.js
```

### Manual Testing
See `API_TESTING_GUIDE.md` for detailed endpoint testing with:
- cURL commands
- Postman examples
- Request/response samples

## 📊 Database Models

### User
- name, email, password (hashed)
- phone, role (HOUSEHOLD)
- locality, address
- location (latitude, longitude)
- timestamps

### Donation
- userId, itemCategory, condition
- quantity, description
- images (array of URLs)
- pickupLocation
- status (AVAILABLE, ACCEPTED, PICKED_UP, COMPLETED)
- assignedNGO (reference)
- timestamps

### Recycle
- userId, wasteCategory, wasteType
- quantity, unit, description
- images (array of URLs)
- pickupLocation
- status (AVAILABLE, ACCEPTED, PICKED_UP, RECYCLED)
- assignedRecycler (reference)
- timestamps

### Notification
- userId, message, type
- relatedId, relatedModel
- isRead flag
- timestamps

## 🤝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 5000) |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | JWT secret key | Yes |
| JWT_EXPIRE | Token expiry time | No (default: 7d) |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | No |
| CLOUDINARY_API_KEY | Cloudinary API key | No |
| CLOUDINARY_API_SECRET | Cloudinary API secret | No |
| NODE_ENV | Environment | No (default: development) |

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure IP is whitelisted in MongoDB Atlas
- Verify credentials in .env
- Check internet connection

### Image Upload Fails
- Verify Cloudinary credentials
- Check image file size (max 5MB)
- Verify file format (JPEG, PNG, GIF, WebP)

### Token Errors
- Ensure token is in Authorization header with "Bearer" prefix
- Check token hasn't expired
- Regenerate token by logging in again

## 📈 Performance

- Indexed queries on userId and status
- Pagination support for notifications
- Memory-based file storage for uploads
- Cloudinary image optimization

## 🚀 Deployment

### Heroku
```bash
git push heroku main
heroku config:set MONGODB_URI=...
npm start
```

### AWS/GCP/Azure
1. Update MongoDB URI for production
2. Set strong JWT_SECRET
3. Configure Cloudinary credentials
4. Set NODE_ENV=production
5. Deploy using respective platform tools

## 📄 License

MIT

## 👨‍💻 Author

EcoLoop Team

## 📞 Support

For issues or questions, contact support@ecoloop.app

---

**Version**: 1.0.0  
**Last Updated**: December 28, 2025  
**Status**: Production Ready

