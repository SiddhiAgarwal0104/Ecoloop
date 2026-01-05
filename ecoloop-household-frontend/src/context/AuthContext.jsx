// import { createContext, useContext, useEffect, useState } from 'react';
// import axios from 'axios';

// const AuthContext = createContext(null);

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
//   return ctx;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem('token'));
//   const [loading, setLoading] = useState(true);

//   /* =========================
//      Load user on refresh
//   ========================= */
//   useEffect(() => {
//     const loadUser = async () => {
//       if (!token) {
//         setLoading(false);
//         return;
//       }

//       try {
//         axios.defaults.headers.common.Authorization = `Bearer ${token}`;
//         const res = await axios.get('http://localhost:5000/api/auth/me');
//         setUser(res.data.data.user);
//       } catch (err) {
//         logout();
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadUser();
//   }, [token]);

//   /* =========================
//      Register (with role support)
//   ========================= */
//   const register = async (userData) => {
//     const res = await axios.post(
//       'http://localhost:5000/api/auth/register',
//       userData
//     );

//     setUser(res.data.data.user);
//     setToken(res.data.data.token);
//     localStorage.setItem('token', res.data.data.token);

//     axios.defaults.headers.common.Authorization = `Bearer ${res.data.data.token}`;
    
//     return res.data.data;
//   };

//   /* =========================
//      Email + Password Login
//   ========================= */
//   const login = async (email, password) => {
//     const res = await axios.post(
//       'http://localhost:5000/api/auth/login',
//       { email, password }
//     );

//     setUser(res.data.data.user);
//     setToken(res.data.data.token);
//     localStorage.setItem('token', res.data.data.token);

//     axios.defaults.headers.common.Authorization = `Bearer ${res.data.data.token}`;
//   };

//   /* =========================
//      Google Login (with role support)
//   ========================= */
//   const googleLogin = async (credential, role = 'HOUSEHOLD') => {
//     const res = await axios.post(
//       'http://localhost:5000/api/auth/google',
//       { credential, role }
//     );

//     setUser(res.data.data.user);
//     setToken(res.data.data.token);
//     localStorage.setItem('token', res.data.data.token);

//     axios.defaults.headers.common.Authorization = `Bearer ${res.data.data.token}`;

//     return res.data.data; // needsProfileCompletion flag
//   };

//   /* =========================
//      Update Profile
//   ========================= */
//   const updateProfile = async (profileData) => {
//     const res = await axios.put(
//       'http://localhost:5000/api/auth/profile',
//       profileData,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     setUser(res.data.data.user);
//     return res.data.data.user;
//   };

//   /* =========================
//      Logout
//   ========================= */
//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('token');
//     delete axios.defaults.headers.common.Authorization;
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         loading,
//         register,
//         login,
//         googleLogin,
//         updateProfile,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

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
  const [error, setError] = useState(null);

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
        setError(null);
      } catch (err) {
        console.error('Failed to load user:', err);
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
    try {
      setError(null);
      setLoading(true);

      const res = await axios.post(
        'http://localhost:5000/api/auth/register',
        userData
      );

      const { user: newUser, token: newToken } = res.data.data;

      setUser(newUser);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      
      return res.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Email + Password Login
  ========================= */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const res = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password }
      );

      const { user: newUser, token: newToken } = res.data.data;

      setUser(newUser);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      
      return res.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Google Login (with role support)
  ========================= */
  const googleLogin = async (credential, role = 'HOUSEHOLD') => {
    try {
      setError(null);
      setLoading(true);

      const res = await axios.post(
        'http://localhost:5000/api/auth/google',
        { credential, role }
      );

      const { user: newUser, token: newToken } = res.data.data;

      setUser(newUser);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      return res.data.data; // needsProfileCompletion flag
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Google login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Update Profile
  ========================= */
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setLoading(true);

      const res = await axios.put(
        'http://localhost:5000/api/auth/profile',
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = res.data.data.user;
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Refresh User Data
  ========================= */
  const refreshUser = async () => {
    if (!token) return;

    try {
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = res.data.data.user;
      setUser(userData);
      
      return userData;
    } catch (err) {
      console.warn('Failed to refresh user data:', err);
      throw err;
    }
  };

  /* =========================
     Logout
  ========================= */
  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common.Authorization;
  };

  /* =========================
     Clear Error
  ========================= */
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    register,
    login,
    googleLogin,
    updateProfile,
    refreshUser,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};