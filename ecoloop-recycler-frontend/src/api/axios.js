// import axios from 'axios';

// /**
//  * Axios instance for EcoLoop Recycler API communication
//  * Handles authentication, error handling, and interceptors
//  */

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// const instance = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//     'X-Client': 'EcoLoop-Recycler',
//     'X-Client-Version': '1.0.0'
//   }
// });

// /**
//  * Request Interceptor
//  * Adds JWT token to all outgoing requests
//  */
// instance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('recycler_token');
    
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     // Add request logging in development
//     if (import.meta.env.DEV) {
//       console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
//     }

//     return config;
//   },
//   (error) => {
//     console.error('❌ Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// /**
//  * Response Interceptor
//  * Handles successful responses and error cases
//  */
// instance.interceptors.response.use(
//   (response) => {
//     // Log successful responses in development
//     if (import.meta.env.DEV) {
//       console.log(`✅ Response from ${response.config.url}`, response.data);
//     }
//     return response;
//   },
//   (error) => {
//     const status = error.response?.status;
//     const message = error.response?.data?.error || error.message;

//     // Handle 401 - Unauthorized (token expired or invalid)
//     if (status === 401) {
//       console.warn('⚠️ Unauthorized - Redirecting to login');
//       localStorage.removeItem('recycler_token');
//       localStorage.removeItem('recycler_user');
//       window.location.href = '/login';
//     }

//     // Handle 403 - Forbidden
//     if (status === 403) {
//       console.error('❌ Forbidden - Access denied');
//     }

//     // Handle 404 - Not Found
//     if (status === 404) {
//       console.error('❌ Resource not found');
//     }

//     // Handle 500 - Server Error
//     if (status === 500) {
//       console.error('❌ Server error:', message);
//     }

//     // Log all errors in development
//     if (import.meta.env.DEV) {
//       console.error(`❌ API Error [${status}]:`, message);
//     }

//     return Promise.reject(error);
//   }
// );

// export default instance;

import axios from 'axios';

/**
 * Axios instance for EcoLoop Recycler API
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
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
    const token = localStorage.getItem('recycler_token');

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
