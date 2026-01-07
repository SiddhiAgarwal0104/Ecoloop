import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  /* =========================
     Load user on refresh
  ========================= */
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        const res = await axios.get('http://localhost:5000/api/auth/me');
        setUser(res.data.data.user);
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  /* =========================
     Register (with role support)
  ========================= */
  const register = async (userData) => {
    const res = await axios.post(
      'http://localhost:5000/api/auth/register',
      userData
    );

    setUser(res.data.data.user);
    setToken(res.data.data.token);
    localStorage.setItem('token', res.data.data.token);

    axios.defaults.headers.common.Authorization = `Bearer ${res.data.data.token}`;
    
    return res.data.data;
  };

  /* =========================
     Email + Password Login
  ========================= */
  const login = async (email, password) => {
    const res = await axios.post(
      'http://localhost:5000/api/auth/login',
      { email, password }
    );

    setUser(res.data.data.user);
    setToken(res.data.data.token);
    localStorage.setItem('token', res.data.data.token);

    axios.defaults.headers.common.Authorization = `Bearer ${res.data.data.token}`;
    
    return {
      success: true,
      user: res.data.data.user,
      token: res.data.data.token,
      needsProfileCompletion: !res.data.data.user.profileCompleted
    };
  };

  /* =========================
     Google Login (with role support)
  ========================= */
  const googleLogin = async (credential, role = 'HOUSEHOLD') => {
    const res = await axios.post(
      'http://localhost:5000/api/auth/google',
      { credential, role }
    );

    setUser(res.data.data.user);
    setToken(res.data.data.token);
    localStorage.setItem('token', res.data.data.token);

    axios.defaults.headers.common.Authorization = `Bearer ${res.data.data.token}`;

    return res.data.data; // needsProfileCompletion flag
  };

  /* =========================
     Update Profile
  ========================= */
  const updateProfile = async (profileData) => {
    const res = await axios.put(
      'http://localhost:5000/api/auth/profile',
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setUser(res.data.data.user);
    return res.data.data.user;
  };

  /* =========================
     Logout
  ========================= */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        googleLogin,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};