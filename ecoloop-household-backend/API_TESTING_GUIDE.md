# EcoLoop Backend - Quick API Testing Guide

## Server Status
✓ **Running on:** http://localhost:5000

## Quick Test Endpoints

### 1. Health Check (No Auth Required)
```bash
GET http://localhost:5000/api/health
```
**Response:**
```json
{
  "status": "success",
  "message": "EcoLoop Household Backend is running"
}
```

---

### 2. User Registration
```bash
POST http://localhost:5000/api/auth/register

Headers:
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "Password@123",
  "locality": "Bandra",
  "address": "123 Main Street, Mumbai",
  "latitude": 19.0596,
  "longitude": 72.8295
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "HOUSEHOLD",
      "locality": "Bandra",
      "address": "123 Main Street, Mumbai",
      "location": {
        "latitude": 19.0596,
        "longitude": 72.8295
      }
    },
    "token": "eyJhbGc..."
  }
}
```

---

### 3. User Login
```bash
POST http://localhost:5000/api/auth/login

Headers:
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGc..."
  }
}
```

---

### 4. Get User Profile (Protected)
```bash
GET http://localhost:5000/api/auth/me

Headers:
Authorization: Bearer <token_from_login>
Content-Type: application/json
```

---

### 5. Create Donation (Protected + Multi-File Upload)
```bash
POST http://localhost:5000/api/donations

Headers:
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- images: [file1.jpg, file2.jpg, ...] (max 5 files)
- itemCategory: CLOTHES
- condition: GOOD
- quantity: 5
- description: Winter clothes in good condition
- address: 456 Charity Lane, Mumbai
- latitude: 19.0760
- longitude: 72.8777
```

**Item Categories:** CLOTHES, FOOD, BOOKS, ELECTRONICS, FURNITURE, TOYS, OTHER

**Conditions:** NEW, LIKE_NEW, GOOD, FAIR, USED

---

### 6. Get My Donations (Protected)
```bash
GET http://localhost:5000/api/donations/my

Headers:
Authorization: Bearer <token>
```

---

### 7. Get Single Donation (Protected)
```bash
GET http://localhost:5000/api/donations/:id

Headers:
Authorization: Bearer <token>
```

---

### 8. Update Donation (Protected)
```bash
PUT http://localhost:5000/api/donations/:id

Headers:
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "quantity": 7,
  "condition": "FAIR",
  "description": "Updated description"
}
```

**Note:** Can only update if status is "AVAILABLE"

---

### 9. Delete Donation (Protected)
```bash
DELETE http://localhost:5000/api/donations/:id

Headers:
Authorization: Bearer <token>
```

**Note:** Can only delete if status is "AVAILABLE"

---

### 10. Create Recycle Request (Protected + Multi-File Upload)
```bash
POST http://localhost:5000/api/recycle

Headers:
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- images: [file1.jpg, file2.jpg, ...] (max 5 files)
- wasteCategory: PLASTIC
- wasteType: SEGREGATED
- quantity: 25
- unit: KG
- description: Plastic bottles and containers
- address: 789 Eco Street, Mumbai
- latitude: 19.0844
- longitude: 72.8867
```

**Waste Categories:** PLASTIC, PAPER, METAL, GLASS, E_WASTE, ORGANIC, MIXED

**Waste Types:** SEGREGATED, MIXED

**Units:** KG, ITEMS, BAGS

---

### 11. Get My Recycle Requests (Protected)
```bash
GET http://localhost:5000/api/recycle/my

Headers:
Authorization: Bearer <token>
```

---

### 12. Get Single Recycle Request (Protected)
```bash
GET http://localhost:5000/api/recycle/:id

Headers:
Authorization: Bearer <token>
```

---

### 13. Update Recycle Request (Protected)
```bash
PUT http://localhost:5000/api/recycle/:id

Headers:
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "quantity": 30,
  "unit": "KG",
  "description": "Updated waste collection"
}
```

---

### 14. Delete Recycle Request (Protected)
```bash
DELETE http://localhost:5000/api/recycle/:id

Headers:
Authorization: Bearer <token>
```

---

### 15. Get Household Dashboard (Protected)
```bash
GET http://localhost:5000/api/dashboard/household

Headers:
Authorization: Bearer <token>
```

**Response includes:**
- Recent donations (last 10)
- Recent recycles (last 10)
- Total donations count
- Total recycles count
- Active/completed status breakdown

---

### 16. Get Household Stats (Protected)
```bash
GET http://localhost:5000/api/dashboard/stats

Headers:
Authorization: Bearer <token>
```

**Response includes:**
- Donation stats (total, available, accepted, picked up, completed)
- Recycle stats (total, available, accepted, picked up, recycled)

---

### 17. Get Notifications (Protected)
```bash
GET http://localhost:5000/api/notifications?page=1&limit=20&unreadOnly=false

Headers:
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `unreadOnly` - Show only unread (true/false)

---

### 18. Get Unread Notification Count (Protected)
```bash
GET http://localhost:5000/api/notifications/unread-count

Headers:
Authorization: Bearer <token>
```

---

### 19. Mark Notification as Read (Protected)
```bash
PUT http://localhost:5000/api/notifications/:id/read

Headers:
Authorization: Bearer <token>
```

---

### 20. Mark All Notifications as Read (Protected)
```bash
PUT http://localhost:5000/api/notifications/read-all

Headers:
Authorization: Bearer <token>
```

---

### 21. Delete Notification (Protected)
```bash
DELETE http://localhost:5000/api/notifications/:id

Headers:
Authorization: Bearer <token>
```

---

## Using Postman

1. **Create a new Request**
2. **Set Method** (GET, POST, PUT, DELETE)
3. **Enter URL** (http://localhost:5000/api/...)
4. **Add Authorization** in Headers tab:
   - Key: `Authorization`
   - Value: `Bearer <your_token>`
5. **Add Body** (if needed) as JSON
6. **Send Request**

---

## Using cURL

```bash
# Get Health Check
curl -X GET http://localhost:5000/api/health

# Register User
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@test.com",
    "password":"Pass@123",
    "phone":"9876543210",
    "locality":"Mumbai",
    "address":"123 Street",
    "latitude":19.0760,
    "longitude":72.8777
  }'

# With Token (after login)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Please provide all required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Please login to access this resource"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Server Error"
}
```

---

## Testing Workflow

1. **Register a new user** (POST /auth/register)
2. **Login** (POST /auth/login) - Get token
3. **Create donation** (POST /donations) - Use token
4. **Get donations** (GET /donations/my) - Verify creation
5. **Create recycle request** (POST /recycle) - Test waste tracking
6. **Get dashboard** (GET /dashboard/household) - View stats
7. **Get notifications** (GET /notifications) - Check messages

---

## Tips

- Always include `Authorization` header for protected routes
- Use `Bearer` prefix before token
- Check response status codes (201 = created, 200 = success, 401 = auth error)
- Validate all required fields before sending
- For file uploads, use `multipart/form-data` content type
- Max 5 images per donation/recycle request

---

**Backend Version:** 1.0.0
**Last Updated:** December 28, 2025
