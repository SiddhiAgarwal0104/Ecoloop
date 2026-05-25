import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) { setLoading(false); return; }
      try {
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('userRole');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (!userData.role && storedRole) userData.role = storedRole;
          setUser(userData);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const saveAuth = (userData, authToken) => {
    const userRole = userData?.role || 'HOUSEHOLD';
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', userRole);
    apiClient.defaults.headers.common.Authorization = `Bearer ${authToken}`;
  };

  const sendOTP = async (email, purpose = 'verify') => {
    const res = await apiClient.post('/auth/send-otp', { email, purpose });
    return res.data;
  };

  const verifyOTP = async (email, otp) => {
    const res = await apiClient.post('/auth/verify-otp', { email, otp });
    return res.data;
  };

  const register = async (payload) => {
    const res = await apiClient.post('/auth/signup', payload);
    const userData = res.data.data?.user || res.data.user;
    const authToken = res.data.token || res.data.data?.token;
    const userRole = userData?.role || payload.role || 'HOUSEHOLD';
    if (userData && !userData.role) userData.role = userRole;
    if (authToken) saveAuth(userData, authToken);
    return {
      success: true,
      user: userData,
      data: res.data.data,
      token: authToken,
      needsProfileCompletion: res.data.data?.needsProfileCompletion ?? false,
    };
  };

  const login = async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    const userData = res.data.data?.user || res.data.user;
    const authToken = res.data.token || res.data.data?.token;
    const userRole = userData?.role || credentials.role?.toUpperCase() || 'HOUSEHOLD';
    if (userData && !userData.role) userData.role = userRole;
    saveAuth(userData, authToken);
    const needsProfileCompletion = !userData?.profileCompleted && (userRole === 'NGO' || userRole === 'RECYCLER');
    return {
      success: true,
      user: userData,
      data: { user: userData },
      token: authToken,
      role: userRole,
      needsProfileCompletion,
    };
  };

  const googleSignIn = async ({ credential, role = 'HOUSEHOLD' }) => {
    const res = await apiClient.post('/auth/google', { credential, role });
    const data = res.data;
    const userData = data.data?.user || data.user;
    const authToken = data.token || data.data?.token;
    if (authToken && userData) saveAuth(userData, authToken);
    return {
      success: data.success,
      user: userData,
      data: data.data,
      token: authToken,
      needsProfileCompletion: data.data?.needsProfileCompletion ?? false,
    };
  };

  const googleLogin = googleSignIn;

  const forgotPassword = async (email) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async ({ email, otp, newPassword, confirmPassword }) => {
    const res = await apiClient.post('/auth/reset-password', {
      email, otp, newPassword, confirmPassword,
    });
    return res.data;
  };

  const updateProfile = async (profileData) => {
    try {
      const userRole = localStorage.getItem('userRole') || user?.role || 'HOUSEHOLD';
      let endpoint = '/auth/profile';
      if (userRole === 'RECYCLER') endpoint = '/recycler/auth/profile';
      else if (userRole === 'NGO') endpoint = '/ngo/auth/profile';
      const res = await apiClient.put(endpoint, profileData);
      const updatedUser = res.data.data?.user || res.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      console.error('❌ [Auth] Update profile error:', err);
      throw err;
    }
  };

  const refreshUser = async () => {
    if (!token) return null;
    try {
      const res = await apiClient.get('/auth/profile');
      const userData = res.data?.data?.user || res.data?.data;
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      return user;
    } catch (err) {
      console.warn('Could not refresh user:', err.message);
      return user;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    delete apiClient.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        api: apiClient,
        register,
        login,
        googleSignIn,
        googleLogin,
        updateProfile,
        refreshUser,
        logout,
        sendOTP,
        verifyOTP,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};