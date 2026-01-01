import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/RecyclerAuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './hooks';
import { initSocket } from './utils/socketService';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import CompleteProfile from './pages/CompleteProfile';
import MyRecycles from './pages/MyRecycles';
import MyDonations from './pages/MyDonations';
import Notifications from './pages/Notifications';
import RecyclerNavigation from './pages/RecyclerNavigation';

/**
 * Socket Initializer Component
 * Initializes Socket.IO connection after user authenticates
 */
function SocketInitializer() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('recycler_token');
      if (token) {
        console.log('🔌 Initializing Socket.IO connection...');
        initSocket(token);
      }
    }
  }, [user]);

  return null;
}

/**
 * Main App Component
 * Routes configuration and context providers
 */
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SocketInitializer />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<CompleteProfile />} />
              <Route path="/my-requests" element={<MyRecycles />} />
              <Route path="/navigate/:recycleId" element={<RecyclerNavigation />} />
              <Route path="/requests" element={<MyDonations />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
