# EcoLoop Recycler Backend

Backend server for recycler management system in EcoLoop application.

## Features
- Recycler authentication and authorization
- Available recycle requests management
- Request acceptance and status tracking
- Location-based request filtering
- Performance statistics and ratings
- Real-time notifications

## Installation

```bash
npm install
```

## Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

API endpoints documentation will be added as routes are implemented.

## Project Structure

- `config/` - Database and service configurations
- `controllers/` - Request handlers
- `routes/` - API route definitions
- `models/` - MongoDB schemas
- `middleware/` - Custom middleware functions
- `utils/` - Utility functions

## Technologies

- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Cloudinary (Image hosting)
- Multer (File upload)
