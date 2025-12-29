import React, { createContext, useState, useContext, useEffect } from 'react';
// ❌ Remove: import { useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ❌ Remove: const navigate = useNavigate();

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/auth/me`);
        const userData = res.data.data?.user || res.data.user;
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, API_BASE_URL]);

  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      const { token: newToken, user } = res.data.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(user);
      setError(null);

      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token: newToken, user } = res.data.data;

      if (!newToken) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(user);
      setError(null);

      // ❌ Remove: navigate('/dashboard');

      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};