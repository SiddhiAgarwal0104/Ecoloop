@echo off
REM Quick start: run backend and frontend (Windows)

echo.
echo 🌱 EcoLoop Local Development Startup
echo ====================================
echo.

REM Check backend env
if not exist "backend\.env" (
  echo ⚠️  backend\.env not found. Copy from .env.example and set MONGODB_URI + JWT_SECRET
  exit /b 1
)

REM Start backend
cd backend
echo Starting backend on port 5000...
start cmd /k "npm start"
timeout /t 3

REM Start frontend
cd ..\frontend
echo Starting frontend on port 3000...
start cmd /k "npm start"

echo.
echo 🚀 Application running!
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:5000
echo.
