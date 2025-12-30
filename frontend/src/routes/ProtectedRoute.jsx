import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

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
    const adminData = localStorage.getItem('adminData');
    
    // Check if both token and adminData exist
    if (!token || !adminData) {
      return false;
    }
    
    // Check if adminData is valid JSON (not the string "undefined")
    if (adminData === 'undefined' || adminData === 'null') {
      // Clean up bad data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      return false;
    }
    
    try {
      JSON.parse(adminData);
      return true;
    } catch (error) {
      // Clean up bad data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      return false;
    }
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
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