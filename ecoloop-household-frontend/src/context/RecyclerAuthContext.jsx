import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../../../ecoloop-recycler-frontend/src/api/axios';

/**
 * RecyclerAuthContext
 * Manages recycler authentication state and operations
 * Provides user data, login, logout, and authentication status
 */

export const RecyclerAuthContext = createContext(null);

/**
 * RecyclerAuthProvider Component
 * Wraps the application to provide authentication context
 */
export const RecyclerAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize auth state from localStorage on mount
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('recycler_token');
        const userData = localStorage.getItem('recycler_user');

        if (token && userData) {
          setUser(JSON.parse(userData));
        }
        setError(null);
      } catch (err) {
        console.error('❌ Auth initialization error:', err);
        setError('Failed to initialize authentication');
        localStorage.removeItem('recycler_token');
        localStorage.removeItem('recycler_user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('📤 Logging in with email:', email);
      const response = await axios.post('/recycler/auth/login', { email, password });
      console.log('📥 Login response:', response.data);
      const { token, user, data } = response.data;
      
      const userData = user || data || {};
      if (token) {
        localStorage.setItem('recycler_token', token);
        localStorage.setItem('recycler_user', JSON.stringify(userData));
        setUser(userData);
        console.log('✅ User logged in:', email);
        return { success: true, data: userData, token };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      console.error('❌ Login error:', {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
        fullError: err
      });
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new recycler
   * @param {object} registrationData - Registration form data
   */
  const register = async (registrationData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post('/recycler/auth/register', registrationData);
      const { token, user, data } = response.data;
      
      const userData = user || data || {};
      if (token) {
        // Store token and user data
        localStorage.setItem('recycler_token', token);
        localStorage.setItem('recycler_user', JSON.stringify(userData));
        setUser(userData);
        console.log('✅ Registration successful');
        return { success: true, data: userData, token };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      console.error('❌ Registration error:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user and clear stored data
   */
  const logout = () => {
    try {
      localStorage.removeItem('recycler_token');
      localStorage.removeItem('recycler_user');
      setUser(null);
      setError(null);
      console.log('✅ User logged out');
    } catch (err) {
      console.error('❌ Logout error:', err);
      setError('Failed to logout');
    }
  };

  /**
   * Update user profile data
   * Makes API call to backend to persist changes
   * @param {object} updatedData - Updated user data
   */
  const updateUser = async (updatedData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📤 Updating user profile...');
      
      // Make API call to backend
      const response = await axios.put('/recycler/auth/profile', updatedData);
      console.log('📥 Profile update response:', response.data);
      
      const { user: updatedUser, data } = response.data;
      const userData = updatedUser || data || {};
      
      // Update localStorage and state
      localStorage.setItem('recycler_user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('✅ User profile updated successfully');
      return { success: true, data: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      console.error('❌ Update profile error:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh user data from backend
   * Fetches the latest user profile from the server
   * Non-blocking with 5 second timeout
   */
  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data from backend...');
      
      // Use Promise.race with a timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Refresh timeout')), 5000)
      );
      
      const response = await Promise.race([
        axios.get('/recycler/auth/profile'),
        timeoutPromise
      ]);
      
      console.log('📥 Refresh user response:', response.data);
      
      const userData = response.data?.user || response.data?.data || {};
      
      // Update localStorage and state
      localStorage.setItem('recycler_user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('✅ User data refreshed successfully');
      return { success: true, data: userData };
    } catch (err) {
      const errorMessage = err.message || 'Failed to refresh user data';
      console.warn('⚠️ Refresh user warning (non-critical):', errorMessage);
      // Don't set error state for refresh - it's non-blocking
      throw new Error(errorMessage);
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateUser,
    refreshUser,
    clearError
  };

  return (
    <RecyclerAuthContext.Provider value={value}>
      {children}
    </RecyclerAuthContext.Provider>
  );
};

/**
 * Custom hook to use recycler auth context
 * @returns {object} Auth context value
 * @throws {Error} If used outside RecyclerAuthProvider
 */
export const useRecyclerAuth = () => {
  const context = useContext(RecyclerAuthContext);
  
  if (!context) {
    throw new Error('useRecyclerAuth must be used within RecyclerAuthProvider');
  }
  
  return context;
};

// Alias for backward compatibility
export const AuthProvider = RecyclerAuthProvider;
