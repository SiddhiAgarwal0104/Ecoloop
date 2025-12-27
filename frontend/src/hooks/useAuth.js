import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for authentication management
 * Handles login, logout, and auth state
 */
const useAuth = () => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');

      if (token && adminData) {
        setAdmin(JSON.parse(adminData));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setAdmin(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, adminData) => {
    try {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(adminData));
      setAdmin(adminData);
      setIsAuthenticated(true);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      setAdmin(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateAdmin = (updatedData) => {
    try {
      const newAdminData = { ...admin, ...updatedData };
      localStorage.setItem('adminData', JSON.stringify(newAdminData));
      setAdmin(newAdminData);
    } catch (error) {
      console.error('Error updating admin:', error);
    }
  };

  const getToken = () => {
    return localStorage.getItem('adminToken');
  };

  return {
    admin,
    isAuthenticated,
    loading,
    login,
    logout,
    updateAdmin,
    getToken,
    checkAuth,
  };
};

export default useAuth;