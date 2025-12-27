// src/services/api.js
// Axios instance and helpers for EcoLoop frontend
// - attaches JWT from localStorage
// - exposes setupInterceptors to allow AuthContext to pass a logout callback

import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// token storage key
const TOKEN_KEY = 'ecoloop_token';

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Configure request + response interceptors.
// onUnauthorized: a callback (usually from AuthContext) called when a 401 is received.
export function setupInterceptors(onUnauthorized) {
  // Request: ensure Authorization header exists if token present
  api.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response: if 401 occurs, notify caller to handle logout
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error && error.response && error.response.status === 401) {
        // call logout handler if provided
        if (typeof onUnauthorized === 'function') onUnauthorized();
      }
      return Promise.reject(error);
    }
  );
}

export default api;
