import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loader from '../components/common/Loader';

/**
 * Protected Route Component
 * Wraps routes that require authentication
 * Redirects to login if not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('adminToken');
    return token !== null;
  };

  // Auto-create mock token for testing (REMOVE IN PRODUCTION)
  useEffect(() => {
    if (!isAuthenticated()) {
      // ⚠️ TEMPORARY: Mock authentication for testing
      // Remove this block when real login is integrated
      const mockToken = 'mock-admin-token-for-testing';
      const mockAdminData = {
        id: '1',
        name: 'Admin User',
        email: 'admin@ecoloop.com',
        role: 'admin',
      };

      localStorage.setItem('adminToken', mockToken);
      localStorage.setItem('adminData', JSON.stringify(mockAdminData));

      console.warn('⚠️ Using mock authentication for testing. Remove in production!');
    }
  }, []);

  // Show loader while checking authentication
  if (!isAuthenticated()) {
    return <Loader fullScreen message="Authenticating..." />;
  }

  // If authenticated, render children
  return children;
};

/**
 * Public Route Component
 * Redirects to dashboard if already authenticated
 */
export const PublicRoute = ({ children }) => {
  const isAuthenticated = () => {
    const token = localStorage.getItem('adminToken');
    return token !== null;
  };

  // If already authenticated, redirect to dashboard
  if (isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Otherwise, render the public page (login)
  return children;
};

export default ProtectedRoute;