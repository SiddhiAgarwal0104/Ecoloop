// src/App.jsx
// Application routing and top-level layout

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WasteProvider } from './contexts/WasteContext';
import { LendProvider } from './contexts/LendContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import ProtectedRoute from './components/ProtectedRoute';

import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WasteLog from './pages/WasteLog';
import WasteHistory from './pages/WasteHistory';
import Lend from './pages/Lend';
import Donate from './pages/Donate';
import NotificationsPage from './pages/Notifications';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <WasteProvider>
          <LendProvider>
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/waste/log"
                element={
                  <ProtectedRoute>
                    <WasteLog />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/waste/history"
                element={
                  <ProtectedRoute>
                    <WasteHistory />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/lend"
                element={
                  <ProtectedRoute>
                    <Lend />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/donate"
                element={
                  <ProtectedRoute>
                    <Donate />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

            </Routes>
          </BrowserRouter>
          </LendProvider>
        </WasteProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
