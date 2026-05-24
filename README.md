# 🌱 EcoLoop - Smart Waste Recycling Platform

<div align="center">

![Platform](https://img.shields.io/badge/Platform-Sustainable%20Recycling-green?style=for-the-badge&logo=leaf&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Tech-MERN%20%2B%20AI-blue?style=for-the-badge&logo=node.js)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-orange?style=for-the-badge)

**Revolutionizing waste management through AI-powered detection, community engagement, and eco-conscious rewards**

[🚀 Get Started](#quick-start) • [📚 Documentation](#documentation) • [🎯 Features](#features) • [💻 Tech Stack](#tech-stack) • [🤝 Contributing](#contributing)

</div>

---

## 🎯 What is EcoLoop?

EcoLoop is a **full-stack web platform** that transforms how households and communities approach waste recycling. By combining **AI-powered waste detection**, **real-time tracking**, **NGO partnerships**, and **gamification**, EcoLoop empowers users to make sustainable choices while contributing to environmental impact goals.

Whether you're a household looking to recycle properly, an NGO managing collections, or an admin overseeing the entire ecosystem, EcoLoop has you covered.

---

## ✨ Key Features

### 🤖 AI-Powered Waste Detection
- **Google Vision API Integration** - Automatically identifies waste types from photos
- **Real-Time Detection** - Get instant feedback on recyclability and waste classification
- **Confidence Scoring** - Understand how confident the AI is in its classification
- **Smart Recycling Tips** - Context-aware advice for proper waste disposal

### 👥 Multi-User Ecosystem
- **Households** - Request waste pickups and track their recycling impact
- **Recyclers** - Accept and manage waste collection requests with real-time updates
- **NGOs** - Verify waste, manage donations, and track environmental impact
- **Admins** - Oversee the entire platform with comprehensive dashboards

### 🔐 Unified Authentication
- **Multi-role Access Control** - Seamless login for households, recyclers, NGOs, and admins
- **OAuth 2.0 Integration** - Google Sign-In support
- **JWT-Based Sessions** - Secure token management
- **Role-Based Dashboards** - Customized interface based on user type

### 📊 Advanced Dashboards
- **Real-Time Analytics** - Track recycling metrics, waste categories, and environmental impact
- **Geographic Visualization** - Map-based views of pickup locations and recycler availability
- **Performance Metrics** - Leaderboards, badges, and achievement tracking
- **Admin Controls** - User management, verification workflows, and system monitoring

### 💬 Real-Time Communication
- **Live Chat System** - Communicate with support and other users
- **Notifications** - Instant updates on request status and achievements
- **Socket.IO Integration** - Real-time message delivery and updates

### 🏆 Gamification & Rewards
- **Achievement Badges** - Unlock badges for milestones and activities
- **Leaderboards** - Compete with your community for sustainability rankings
- **Points System** - Earn rewards for completed recycling requests
- **Impact Tracking** - See your environmental contribution in real-time

### 📍 Location-Based Services
- **Route Optimization** - Leaflet maps with routing for pickups
- **Locality-Based Matching** - Connect households with nearby recyclers
- **Real-Time Tracking** - Follow pickup requests as they progress

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ 
- **MongoDB** (local or Atlas)
- **Google Cloud Vision API** credentials
- **Cloudinary** account (for image storage)

### Backend Setup

```bash
cd ecoloop-household-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure your environment variables
# Add: MONGODB_URI, GOOGLE_VISION_CREDENTIALS, CLOUDINARY_API_KEY, etc.

# Start the server
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd ecoloop-household-frontend

# Install dependencies
npm install

# Create .env file with API endpoint
echo "VITE_API_URL=http://localhost:5000" > .env

# Start development server
npm run dev
# Access at http://localhost:5173
```

### First Time Setup

1. **Seed Test Data**
   ```bash
   cd ecoloop-household-backend
   node scripts/seedBadges.js
   ```

2. **Create Admin Account**
   - Register via the frontend
   - Use MongoDB to set `role: "admin"` for your user

3. **Configure Google Cloud Vision**
   - Place credentials JSON in `config/google-vision-credentials.json`
   - Set `ENABLE_AI_DETECTION=true` in `.env`

---

## 📁 Project Structure

```
ecoloop-recycler-merge/Ecoloop/
├── ecoloop-household-backend/          # Express.js backend API
│   ├── controllers/                    # Route handlers
│   ├── models/                         # MongoDB schemas
│   ├── routes/                         # API endpoints
│   ├── middleware/                     # Auth, validation, error handling
│   ├── services/                       # Business logic & external APIs
│   ├── config/                         # Database, storage, Vision API
│   ├── scripts/                        # Data migration & seeding
│   └── server.js                       # Main server file
│
├── ecoloop-household-frontend/         # React + Vite frontend
│   ├── src/
│   │   ├── pages/                      # React page components
│   │   ├── components/                 # Reusable UI components
│   │   ├── services/                   # API client
│   │   ├── hooks/                      # Custom React hooks
│   │   └── App.jsx                     # Root component
│   ├── vite.config.js                  # Vite configuration
│   └── tailwind.config.js              # Tailwind CSS config
│
└── Documentation/                      # Comprehensive guides
    ├── ADMIN_IMPLEMENTATION_GUIDE.md   # Admin features
    ├── AI_DETECTION_QUICK_START.md     # AI setup guide
    ├── UNIFIED_AUTH_IMPLEMENTATION.md  # Authentication system
    └── [More guides...]
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + OAuth 2.0
- **Real-Time**: Socket.IO
- **AI Detection**: Google Cloud Vision API
- **File Storage**: Cloudinary
- **Password Security**: bcryptjs

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Maps**: Leaflet + react-leaflet
- **UI Components**: Lucide React icons
- **Real-Time**: Socket.IO client
- **Notifications**: React-Toastify

### DevOps & Tools
- **Version Control**: Git
- **Package Management**: npm
- **Development**: Nodemon (backend), Vite (frontend)
- **Data Visualization**: Excel export capabilities

---

## 📚 Documentation

Comprehensive documentation is available in the repository:

| Document | Purpose |
|----------|---------|
| [Admin Implementation Guide](./ADMIN_IMPLEMENTATION_GUIDE.md) | Admin dashboard & features |
| [AI Detection Guide](./AI_DETECTION_QUICK_START.md) | AI waste detection setup |
| [Unified Auth Documentation](./UNIFIED_AUTH_IMPLEMENTATION.md) | Authentication system |
| [Deployment Guide](./DEPLOYMENT_GUIDE.md) | Production deployment |
| [Testing Guide](./TESTING_GUIDE_COMPREHENSIVE.md) | Testing & verification |
| [Backend Routes](./QUICK_REFERENCE_ENDPOINTS.md) | API endpoint reference |

---

## 🔑 Core Features Deep Dive

### 1️⃣ AI Waste Detection

```javascript
// Upload waste image → AI analyzes → Gets classification
POST /api/recycle/create
- Accepts image uploads
- Calls Google Vision API
- Returns: waste type, confidence, recyclability status
- Stores results in database for analytics
```

**Response Example:**
```json
{
  "success": true,
  "detection": {
    "wasteType": "Plastic Bottle",
    "confidence": 0.94,
    "recyclable": true,
    "tips": [
      "Rinse the bottle thoroughly",
      "Remove the label",
      "Place in plastic recycling bin"
    ]
  }
}
```

### 2️⃣ Request Management

Households create requests → Recyclers accept → Collection happens → Impact tracked

**Request States**: `pending` → `assigned` → `in-transit` → `completed` → `cancelled`

### 3️⃣ NGO Verification System

- NGOs verify incoming waste
- Track waste categories and volumes
- Generate impact reports
- Manage donations

### 4️⃣ Admin Dashboard

- User management and verification
- System-wide analytics
- Revenue tracking
- Request monitoring
- Badge management

---

## 🔌 API Endpoints Overview

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/google-signin     # Google OAuth login
POST   /api/auth/refresh-token     # Refresh JWT
```

### Recycling
```
GET    /api/recycle                # Get all requests
POST   /api/recycle/create         # Create new request
GET    /api/recycle/:id            # Get request details
PUT    /api/recycle/:id            # Update request
PUT    /api/recycle/:id/accept     # Accept request (recycler)
```

### Admin
```
GET    /api/admin/dashboard        # Dashboard analytics
GET    /api/admin/users            # Manage users
POST   /api/admin/verify           # Verify users/NGOs
```

👉 [Full endpoint reference](./QUICK_REFERENCE_ENDPOINTS.md)

---

## 🎓 How to Use

### For Households
1. **Sign up** with Google or email
2. **Create a recycle request** - Upload waste images, add details
3. **AI detects waste type** - Get recycling tips automatically
4. **Schedule pickup** - Choose date and time
5. **Recycler accepts** - Receive confirmation
6. **Waste collected** - Track status in real-time
7. **Earn rewards** - Get badges and points!

### For Recyclers
1. **Register** as recycler
2. **Get verified** by admin
3. **View available requests** - See nearby waste pickups
4. **Accept requests** - Start earning
5. **Track pickups** - Real-time location & status
6. **Complete requests** - Upload proof of collection
7. **Earn commission** - Get paid for completed tasks

### For NGOs
1. **Partner with EcoLoop** - Apply for verification
2. **Accept donations** - Manage incoming waste
3. **Verify waste quality** - Ensure proper categorization
4. **Generate reports** - Track impact and donations
5. **Connect with recyclers** - Manage your supply chain

### For Admins
1. **Log in** to admin dashboard
2. **Verify users** - Approve recyclers and NGOs
3. **Monitor requests** - Track all activities
4. **Manage rewards** - Create and assign badges
5. **View analytics** - See system performance
6. **Export reports** - Download data for analysis

---

## 🚀 Performance & Optimization

- **Real-time Updates**: WebSocket integration for instant notifications
- **Image Optimization**: Cloudinary for responsive image delivery
- **Database Indexing**: Optimized MongoDB queries
- **Caching**: JWT tokens for stateless authentication
- **Scalability**: Modular architecture for horizontal scaling

---

## 🔒 Security Features

✅ **JWT Authentication** - Secure token-based access  
✅ **OAuth 2.0** - Third-party authentication  
✅ **Password Hashing** - bcryptjs encryption  
✅ **Role-Based Access Control** - User type restrictions  
✅ **Input Validation** - Sanitized inputs on backend  
✅ **CORS Protection** - Cross-origin request handling  
✅ **Environment Variables** - Sensitive data protection  

---

## 📊 Database Schema

### Key Collections
- **Users** - Households, Recyclers, NGOs, Admins
- **RecycleRequests** - Waste pickup requests with AI detection data
- **Donations** - Waste donations to NGOs
- **Badges** - Achievement system
- **Chat** - User communications
- **Notifications** - Real-time alerts

---

## 🧪 Testing

```bash
# Backend tests
cd ecoloop-household-backend
npm test

# Frontend tests
cd ecoloop-household-frontend
npm test

# Seed test data
node scripts/seedBadges.js
node scripts/seed-test-data.js
```

---

## 🐛 Troubleshooting

### Backend won't start?
- Check MongoDB connection string in `.env`
- Verify Node.js version (v16+)
- Clear node_modules: `rm -rf node_modules && npm install`

### AI detection not working?
- Ensure Google Vision credentials are in `config/`
- Verify `ENABLE_AI_DETECTION=true` in `.env`
- Check Google Cloud project has Vision API enabled

### Frontend build fails?
- Clear Vite cache: `rm -rf node_modules/.vite`
- Rebuild dependencies: `npm install`

### Real-time features not working?
- Verify Socket.IO is running on backend
- Check CORS configuration for WebSocket connections

👉 See [Troubleshooting Guide](./TESTING_GUIDE_COMPREHENSIVE.md) for more solutions

---

## 📈 Metrics & Impact

With EcoLoop, users can track their environmental impact:

- 📦 **Waste Collected** - Track total waste properly recycled
- 🌍 **CO₂ Prevented** - Calculate environmental benefits
- 🏆 **Achievements Unlocked** - Badges and milestones
- 💰 **Earnings** (Recyclers) - Total commission earned
- 📊 **Rankings** - Community leaderboards

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Workflow
```bash
# Setup development environment
npm install

# Create feature branch
git checkout -b feature/your-feature

# Make changes & test
npm run dev

# Commit & push
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

---

## 🗺️ Roadmap

- [x] Core waste collection system
- [x] AI waste detection
- [x] Multi-role authentication
- [x] Real-time notifications
- [x] Admin dashboard
- [ ] Mobile app (React Native)
- [ ] Advanced analytics & reporting
- [ ] Integration with municipal systems
- [ ] Blockchain for waste tracking
- [ ] Machine learning for route optimization

---

## 📞 Support & Community

- 📧 **Email**: support@ecoloop.com
- 💬 **Chat**: In-app chat system
- 🐛 **Report Issues**: Create an issue on GitHub
- 💡 **Discussions**: Start a discussion for ideas
- 🌐 **Website**: www.ecoloop.com

---

## 📝 License

This project is licensed under the **ISC License** - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Google Cloud Vision API for AI detection capabilities
- Cloudinary for image management
- MongoDB for robust database
- React and Node.js communities
- All contributors and testers

---

## 📊 Project Stats

![Lines of Code](https://img.shields.io/badge/Lines%20of%20Code-10K%2B-blue?style=flat-square)
![Files](https://img.shields.io/badge/Files-200%2B-green?style=flat-square)
![API Endpoints](https://img.shields.io/badge/API%20Endpoints-50%2B-orange?style=flat-square)
![Documentation](https://img.shields.io/badge/Documentation%20Pages-25%2B-purple?style=flat-square)

---

<div align="center">

### 🌿 Join the Green Revolution!

**Make a difference today. Recycle smarter with EcoLoop.**

[⭐ Star us on GitHub](https://github.com/yourusername/ecoloop) • [🚀 Try the Demo](#quick-start) • [📚 Read the Docs](#documentation)

---

**Made with ❤️ for a sustainable future**

</div>
