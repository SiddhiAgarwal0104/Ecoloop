import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure axios instance for API calls
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
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
        // Set auth header
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        
        // User is already loaded from login, just restore it from localStorage if needed
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('userRole');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Ensure role field is present
          if (!userData.role && storedRole) {
            userData.role = storedRole;
          }
          
          console.log('👤 User loaded from localStorage:', { name: userData.name, role: userData.role });
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

  /* =========================
     Register (with role support)
     Unified endpoint for all three roles
  ========================= */
  const register = async (name, email, password, passwordConfirm, phone, role) => {
    // Handle both object and parameter forms
    let nameVal, emailVal, passwordVal, passwordConfirmVal, phoneVal, roleVal;
    
    if (typeof name === 'object') {
      // Object form: register({ name, email, password, passwordConfirm, phone, role })
      nameVal = name.name;
      emailVal = name.email;
      passwordVal = name.password;
      passwordConfirmVal = name.passwordConfirm;
      phoneVal = name.phone;
      roleVal = name.role;
    } else {
      // Parameter form: register(name, email, password, passwordConfirm, phone, role)
      nameVal = name;
      emailVal = email;
      passwordVal = password;
      passwordConfirmVal = passwordConfirm;
      phoneVal = phone;
      roleVal = role;
    }

    const payload = {
      name: nameVal,
      email: emailVal,
      password: passwordVal,
      passwordConfirm: passwordConfirmVal,
      phone: phoneVal || null,
      role: roleVal || 'HOUSEHOLD' // Default to household
    };

    const res = await axios.post(
      'http://localhost:5000/api/auth/signup',
      payload
    );

    // Extract user data - handle different response formats
    const userData = res.data.user || res.data.data?.user;
    const token = res.data.token;
    const userRole = userData?.role || roleVal || 'HOUSEHOLD';

    // Ensure userData has the role field
    if (userData && !userData.role) {
      userData.role = userRole;
    }

    setUser(userData);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    // Store role for quick access
    localStorage.setItem('userRole', userRole);

    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    
    return {
      success: true,
      user: userData,
      token: token,
      needsProfileCompletion: !userData?.profileCompleted && roleVal !== 'RECYCLER'
    };
  };

  /* =========================
     Email + Password Login
     Unified endpoint for all three roles
  ========================= */
  const login = async (credentials) => {
    // Handle both object and parameter forms
    let email, password, role;
    
    if (typeof credentials === 'object') {
      email = credentials.email;
      password = credentials.password;
      role = credentials.role;
    } else {
      // Handle old signature: login(email, password, role)
      email = credentials;
      password = arguments[1];
      role = arguments[2];
    }

    const payload = {
      email,
      password,
      role: role || 'HOUSEHOLD' // Default to household if not specified
    };

    const res = await axios.post(
      'http://localhost:5000/api/auth/login',
      payload
    );

    // Extract user data - handle different response formats
    const userData = res.data.user || res.data.data?.user;
    const token = res.data.token;
    const userRole = userData?.role || role?.toUpperCase() || 'HOUSEHOLD';

    // Ensure userData has the role field
    if (userData && !userData.role) {
      userData.role = userRole;
    }

    setUser(userData);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', userRole);

    // Update axios headers
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    
    // Check if profile completion is needed
    const needsProfileCompletion = !userData?.profileCompleted && (userRole === 'NGO' || userRole === 'RECYCLER');
    
    return {
      success: true,
      user: userData,
      data: { user: userData },
      token: token,
      role: userRole,
      needsProfileCompletion: needsProfileCompletion
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

    const userData = res.data.data.user;
    const token = res.data.data.token;
    const userRole = userData?.role || role;

    // Ensure userData has the role field
    if (userData && !userData.role) {
      userData.role = userRole;
    }

    setUser(userData);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', userRole);

    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    return res.data.data; // needsProfileCompletion flag
  };

  /* =========================
     Update Profile
  ========================= */
  const updateProfile = async (profileData) => {
    try {
      // Route to appropriate endpoint based on user role
      const userRole = localStorage.getItem('userRole') || user?.role || 'HOUSEHOLD';
      let endpoint = '/auth/profile'; // Default for household
      
      if (userRole === 'RECYCLER') {
        endpoint = '/recycler/auth/profile';
      } else if (userRole === 'NGO') {
        endpoint = '/ngo/auth/profile';
      }
      
      console.log(`📝 [Auth] Updating profile via endpoint: ${endpoint}`);
      
      const res = await apiClient.put(endpoint, profileData);
      const updatedUser = res.data.data?.user || res.data.user;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('✅ [Auth] Profile updated, profileCompleted:', updatedUser?.profileCompleted);
      
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
      return user; // Return existing user if response is empty
    } catch (err) {
      console.warn('Could not refresh user (endpoint may not exist):', err.message);
      // Don't throw, just return existing user
      return user;
    }
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
        api: apiClient,
        register,
        login,
        googleLogin,
        updateProfile,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};