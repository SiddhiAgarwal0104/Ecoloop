import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Admin Context
 * Global state management for admin authentication and data
 */

// Create Context
const AdminContext = createContext(null);

// Custom hook to use AdminContext
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

/**
 * Admin Context Provider
 * Wraps the application and provides admin state
 */
export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if admin is authenticated
   */
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');

      if (token && adminData) {
        // Verify token with backend
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setAdmin(response.data.data);
          setIsAuthenticated(true);
        } else {
          clearAuthData();
        }
      } else {
        clearAuthData();
      }
    } catch (err) {
      console.error('Auth check error:', err);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login function
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        { email, password }
      );

      if (response.data.success) {
        const { token, admin: adminData, city } = response.data.data;

        // Store in localStorage
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify({ ...adminData, city }));

        // Update state
        setAdmin({ ...adminData, city });
        setIsAuthenticated(true);
        setLoading(false);

        // Redirect to dashboard
        navigate('/admin/dashboard');

        return { success: true, message: 'Login successful' };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      // Call logout endpoint
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local data regardless of API call result
      clearAuthData();
      navigate('/login');
    }
  };

  /**
   * Update admin profile
   */
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/auth/profile`,
        updates,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const updatedAdmin = response.data.data;

        // Update localStorage
        localStorage.setItem('adminData', JSON.stringify(updatedAdmin));

        // Update state
        setAdmin(updatedAdmin);
        setLoading(false);

        return { success: true, message: 'Profile updated successfully' };
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Update failed';
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  /**
   * Change password
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setLoading(false);
        return { success: true, message: 'Password changed successfully' };
      } else {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Password change failed';
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  /**
   * Clear authentication data
   */
  const clearAuthData = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
    setIsAuthenticated(false);
  };

  /**
   * Get current token
   */
  const getToken = () => {
    return localStorage.getItem('adminToken');
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role) => {
    return admin?.role === role;
  };

  /**
   * Refresh admin data from server
   */
  const refreshAdmin = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const updatedAdmin = response.data.data;
        localStorage.setItem('adminData', JSON.stringify(updatedAdmin));
        setAdmin(updatedAdmin);
        return { success: true };
      }
    } catch (err) {
      console.error('Refresh admin error:', err);
      return { success: false };
    }
  };

  // Context value
  const value = {
    // State
    admin,
    isAuthenticated,
    loading,
    error,

    // Functions
    login,
    logout,
    updateProfile,
    changePassword,
    checkAuthStatus,
    getToken,
    hasRole,
    refreshAdmin,
    clearError: () => setError(null),
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContext;