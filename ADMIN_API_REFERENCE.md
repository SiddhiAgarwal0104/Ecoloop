# Admin API Reference Guide

## Base URL
```
http://localhost:5000/api/admin
```

## Authentication
All endpoints (except `/login` and `/register`) require:
```
Header: Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### 1. Admin Login
```http
POST /login
Content-Type: application/json

{
  "email": "admin@ecoloop.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Admin logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "email": "admin@ecoloop.com",
    "name": "Admin Name",
    "role": "ADMIN"
  }
}
```

### 2. Register Admin
```http
POST /register
Content-Type: application/json

{
  "email": "newadmin@ecoloop.com",
  "password": "password123",
  "name": "New Admin"
}

Response:
{
  "success": true,
  "message": "Admin registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

---

## 📊 Dashboard & Stats

### 3. Get Platform Statistics
```http
GET /stats/platform
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "users": {
      "totalHouseholds": 150,
      "totalNGOs": 25,
      "verifiedNGOs": 20,
      "totalRecyclers": 10
    },
    "donations": {
      "total": 500,
      "completed": 450,
      "pending": 50
    },
    "recycling": {
      "total": 1200
    }
  }
}
```

---

## 👥 NGO Management

### 4. Get Pending NGO Verification Requests
```http
GET /ngos/pending?page=1&limit=10&search=name
Authorization: Bearer <token>

Query Parameters:
- page (default: 1)
- limit (default: 10)
- search (optional - searches name, email, locality)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "ngo_id",
      "name": "NGO Name",
      "email": "ngo@email.com",
      "phone": "1234567890",
      "locality": "City Area",
      "city": "City Name",
      "address": "Full Address",
      "isVerified": false,
      "verificationRequestedAt": "2026-01-06T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

### 5. Get Verified NGOs
```http
GET /ngos/verified?page=1&limit=10&locality=area&isVerified=true
Authorization: Bearer <token>

Query Parameters:
- page (default: 1)
- limit (default: 10)
- locality (optional)
- isVerified (optional: true/false)
- search (optional)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "ngo_id",
      "name": "NGO Name",
      "email": "ngo@email.com",
      "phone": "1234567890",
      "locality": "City Area",
      "city": "City Name",
      "averageRating": 4.5,
      "totalRatings": 12,
      "isVerified": true,
      "verificationApprovedAt": "2026-01-05T10:00:00Z",
      "donationsReceived": 45
    }
  ],
  "pagination": { ... }
}
```

### 6. Approve NGO Verification
```http
PUT /ngos/:ngoId/approve
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "NGO verified successfully",
  "data": {
    "_id": "ngo_id",
    "name": "NGO Name",
    "email": "ngo@email.com",
    "locality": "City Area",
    "isVerified": true
  }
}
```

### 7. Reject NGO Verification
```http
PUT /ngos/:ngoId/reject
Content-Type: application/json
Authorization: Bearer <token>

{
  "reason": "Incomplete documentation"
}

Response:
{
  "success": true,
  "message": "NGO verification rejected",
  "data": {
    "_id": "ngo_id",
    "name": "NGO Name",
    "email": "ngo@email.com",
    "locality": "City Area",
    "isVerified": false,
    "verificationRejectionReason": "Incomplete documentation"
  }
}
```

---

## 💝 Donations Management

### 8. Get Donations Overview
```http
GET /donations?page=1&limit=10&status=COMPLETED&search=query
Authorization: Bearer <token>

Query Parameters:
- page (default: 1)
- limit (default: 10)
- status (optional: AVAILABLE, ACCEPTED, PICKED_UP, COMPLETED)
- search (optional)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "donation_id",
      "itemCategory": "CLOTHES",
      "quantity": 5,
      "status": "COMPLETED",
      "createdAt": "2026-01-05T10:00:00Z",
      "pickupLocation": {
        "address": "123 Main St",
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "userId": {
        "_id": "user_id",
        "name": "Household Name",
        "email": "household@email.com",
        "locality": "City Area"
      },
      "assignedNGO": {
        "_id": "ngo_id",
        "name": "NGO Name",
        "locality": "City Area"
      }
    }
  ],
  "pagination": { ... }
}
```

### 9. Get NGOs Overview
```http
GET /overview/ngos?page=1&limit=10&locality=area&isVerified=true
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "ngo_id",
      "name": "NGO Name",
      "email": "ngo@email.com",
      "phone": "1234567890",
      "locality": "City Area",
      "city": "City Name",
      "averageRating": 4.5,
      "ratingCount": 12,
      "isVerified": true,
      "verificationApprovedAt": "2026-01-05T10:00:00Z",
      "donationsReceived": 45
    }
  ],
  "pagination": { ... }
}
```

### 10. Get Recyclers Overview
```http
GET /overview/recyclers?page=1&limit=10&locality=area
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "recycler_id",
      "name": "Recycler Name",
      "email": "recycler@email.com",
      "phone": "1234567890",
      "locality": "City Area",
      "city": "City Name",
      "averageRating": 4.2,
      "ratingCount": 8,
      "totalPickups": 120
    }
  ],
  "pagination": { ... }
}
```

---

## 🏆 Leaderboards

### 11. Get Global Leaderboard
```http
GET /leaderboard/global?page=1&limit=20
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "rank": 1,
      "name": "Top Household",
      "email": "household@email.com",
      "locality": "City Area",
      "city": "City",
      "donations": 45,
      "recycleActions": 120,
      "totalActions": 165,
      "averageRating": 4.8
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### 12. Get Locality Leaderboard
```http
GET /leaderboard/locality/CityArea?page=1&limit=20
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [ ... ],
  "locality": "CityArea",
  "pagination": { ... }
}
```

### 13. Get All Localities
```http
GET /localities
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    "Downtown",
    "Uptown",
    "Midtown",
    "Suburbs"
  ]
}
```

---

## ⭐ Ratings

### 14. Get NGO Ratings
```http
GET /ratings/ngos?page=1&limit=10
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "ngo_id",
      "name": "NGO Name",
      "email": "ngo@email.com",
      "locality": "City Area",
      "averageRating": 4.7,
      "ratingCount": 20
    }
  ],
  "pagination": { ... }
}
```

### 15. Get Recycler Ratings
```http
GET /ratings/recyclers?page=1&limit=10
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "recycler_id",
      "name": "Recycler Name",
      "email": "recycler@email.com",
      "locality": "City Area",
      "averageRating": 4.5,
      "ratingCount": 15
    }
  ],
  "pagination": { ... }
}
```

---

## 📥 Reports Download

### 16. Download Weekly Activity Report
```http
GET /reports/weekly?days=7
Authorization: Bearer <token>

Query Parameters:
- days (default: 7, max: 90)

Response: Binary Excel file (.xlsx)
Filename: weekly_platform_activity_report_2026-01-06.xlsx

Excel Sheets:
- Summary (key metrics)
- Donations (all donations in period)
- Recycling (all recycle actions)
- Activity by Type (breakdown by user role)
```

### 17. Download Donation Report
```http
GET /reports/donations?startDate=2026-01-01&endDate=2026-01-06&status=COMPLETED
Authorization: Bearer <token>

Query Parameters:
- startDate (optional: YYYY-MM-DD)
- endDate (optional: YYYY-MM-DD)
- status (optional: AVAILABLE, ACCEPTED, PICKED_UP, COMPLETED)
- category (optional: CLOTHES, FOOD, BOOKS, ELECTRONICS, FURNITURE, TOYS, OTHER)

Response: Binary Excel file (.xlsx)
Filename: donation_report_2026-01-06.xlsx

Excel Sheets:
- Donations Report (filtered donation data)
```

### 18. Download NGO Performance Report
```http
GET /reports/ngo-performance
Authorization: Bearer <token>

Response: Binary Excel file (.xlsx)
Filename: ngo_performance_report_2026-01-06.xlsx

Excel Sheets:
- NGO Performance (all verified NGOs with metrics)
```

---

## Error Responses

### Common Error Codes

**400 Bad Request**
```json
{
  "success": false,
  "message": "Please provide email and password"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied. Admin role required"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "NGO not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📋 Request/Response Examples

### Complete Flow Example

**1. Admin Login**
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ecoloop.com",
    "password": "password123"
  }'
```

**2. View Pending NGOs**
```bash
curl -X GET 'http://localhost:5000/api/admin/ngos/pending?page=1&limit=5' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**3. Approve an NGO**
```bash
curl -X PUT http://localhost:5000/api/admin/ngos/ngo_id_here/approve \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**4. Download Weekly Report**
```bash
curl -X GET 'http://localhost:5000/api/admin/reports/weekly?days=7' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -o report.xlsx
```

---

## 🔑 Important Notes

- All endpoints require admin authentication
- Tokens expire based on JWT_SECRET configuration
- Pagination is 1-based (page 1 is first page)
- Search is case-insensitive and searches multiple fields
- Dates should be in ISO 8601 format (YYYY-MM-DD)
- Excel reports are generated on-demand
- File downloads use streaming for large files
- All timestamps are in UTC

---

## 🧪 Testing with cURL or Postman

**Import into Postman:**
1. Create new collection "EcoLoop Admin"
2. Add requests following the examples above
3. Save token from login response
4. Use {{token}} variable in Authorization headers
5. Set base URL to {{baseUrl}}/api/admin

**Environment Variables:**
```
baseUrl: http://localhost:5000
token: <token_from_login>
```

---

**Last Updated:** January 6, 2026
