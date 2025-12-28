#!/bin/bash
# Quick start: run backend and frontend in parallel

echo "🌱 EcoLoop Local Development Startup"
echo "===================================="

# Start backend
cd backend
if [ ! -f .env ]; then
  echo "⚠️  backend/.env not found. Copy from .env.example and set MONGODB_URI + JWT_SECRET"
  exit 1
fi
npm start &
BACKEND_PID=$!
echo "✓ Backend starting (PID: $BACKEND_PID)"

# Wait for backend to start
sleep 3

# Start frontend
cd ../frontend
if [ ! -f .env.local ]; then
  echo "✓ Using default frontend config (proxy to http://localhost:5000)"
fi
npm start &
FRONTEND_PID=$!
echo "✓ Frontend starting (PID: $FRONTEND_PID)"

echo ""
echo "🚀 Application running!"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  Press Ctrl+C to stop both"
echo ""

# Keep running
wait
