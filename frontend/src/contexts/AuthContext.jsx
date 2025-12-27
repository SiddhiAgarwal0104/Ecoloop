// src/contexts/AuthContext.jsx
// Provides authentication state and helpers to the app (role aware)

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setAuthToken } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUnauthorized = useCallback(() => {
    // Clear token and user on 401
    setAuthToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    // Listen for global unauthorized events from axios interceptor
    const handler = () => handleUnauthorized();
    window.addEventListener('ecoloop:unauthorized', handler);
    return () => window.removeEventListener('ecoloop:unauthorized', handler);
  }, [handleUnauthorized]);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/auth/me');
      // backend may return { user } or user directly
      const u = res.data.user || res.data;
      setUser(u);
    } catch (err) {
      // keep user null on error
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // initialize from stored token
    const token = localStorage.getItem('ecoloop_token');
    if (token) {
      setAuthToken(token);
      fetchMe().catch(() => {});
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  // POST /api/auth/login -> { token }
  const login = async (credentials) => {
    setAuthLoading(true);
    setError(null);
    try {
      // Backend expects `emailOrPhone` and `password`
      const payload = {
        emailOrPhone: credentials.email || credentials.emailOrPhone || credentials.phone,
        password: credentials.password
      };
      const res = await api.post('/auth/login', payload);
      const token = res.data.token || res.data.accessToken || res.data;
      if (!token) throw new Error('No token returned from login');
      setAuthToken(token);
      await fetchMe();
      setAuthLoading(false);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      setAuthLoading(false);
      return { success: false, error: msg };
    }
  };

  // POST /api/auth/register -> expect token
  // payload should include: name, email, password, role, roleDetails (object), location (object)
  const register = async (payload) => {
    setAuthLoading(true);
    setError(null);
    try {
      // Map frontend payload to backend expected fields
      const mapped = {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        address: payload.location || payload.address || {},
        organizationDetails:
          payload.role === 'ngo' || payload.role === 'recycler' ? payload.roleDetails || {} : undefined
      };

      const res = await api.post('/auth/register', mapped);
      const token = res.data.token || res.data.accessToken || res.data;
      if (token) {
        setAuthToken(token);
        await fetchMe();
      }
      setAuthLoading(false);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      setAuthLoading(false);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    // simple navigation to login
    if (window.location.pathname !== '/login') window.location.href = '/login';
  };

  const isRole = (r) => !!(user && user.role === r);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authLoading,
        error,
        login,
        register,
        logout,
        fetchMe,
        isRole,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
