import axios from 'axios';

/**
 * Central Axios instance for EcoLoop
 * Supports Household, Recycler, NGO, Admin
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client': 'EcoLoop-Web'
  }
});

/**
 * Request Interceptor
 * Attach correct JWT based on role
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Priority-based token check
    const token =
      localStorage.getItem('token') ||            // Household / NGO / Admin
      localStorage.getItem('recycler_token');     // Recycler

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
 * Handle auth expiry globally
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn('⚠️ Session expired, logging out');

      // Clear all possible tokens
      localStorage.removeItem('token');
      localStorage.removeItem('recycler_token');
      localStorage.removeItem('user');
      localStorage.removeItem('recycler_user');

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
