import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AdminProvider } from './context/AdminContext';
import Header from './components/admin/Header';
import Sidebar from './components/admin/Sidebar';
import AdminRoutes from './routes/AdminRoutes';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/admin/Login';
import Register from './pages/admin/Register';
import CompleteProfile from './pages/admin/CompleteProfile';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout wrapper for admin pages
const AdminLayout = ({ children }) => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-eco-light">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-[calc(100vh-73px)]">
            {children}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Login Route - MUST be before protected routes */}
      <Route path="/admin/login" element={<Login />} />

      {/* Register Route - PUBLIC */}
      <Route path="/admin/register" element={<Register />} />

      {/* Complete Profile Route - SEMI-PROTECTED (requires token but no admin data check) */}
      <Route path="/admin/complete-profile" element={<CompleteProfile />} />

      {/* Admin Routes - Protected */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminRoutes />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Root redirect to login */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      {/* 404 - Not Found */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center h-screen bg-eco-light">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-eco-main mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-6">Page not found</p>
              <a href="/admin/login" className="btn-primary inline-block">
                Go to Login
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <Router>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AdminProvider>
          <AppRoutes />
        </AdminProvider>
      </GoogleOAuthProvider>
    </Router>
  );
}

export default App;