

import axios from 'axios';

/**
 * Axios instance for EcoLoop Recycler API
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const instance = axios.create({
  baseURL: '${API_BASE_URL}/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client': 'EcoLoop-Recycler',
    'X-Client-Version': '1.0.0'
  }
});

/**
 * Request Interceptor
 * Attach Recycler JWT
 */
instance.interceptors.request.use(
  (config) => {
    // Use unified token from localStorage (set by AuthContext)
    const token = localStorage.getItem('token') || localStorage.getItem('recycler_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(
        `📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 */
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn('⚠️ Unauthorized – logging out');
      localStorage.removeItem('recycler_token');
      localStorage.removeItem('recycler_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default instance;
