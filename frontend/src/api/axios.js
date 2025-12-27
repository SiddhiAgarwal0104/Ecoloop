import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('ecoloop_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('ecoloop_token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// initialize token
const token = localStorage.getItem('ecoloop_token');
if (token) setAuthToken(token);

api.interceptors.request.use(
  (config) => {
    const t = localStorage.getItem('ecoloop_token');
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      setAuthToken(null);
      window.dispatchEvent(new Event('ecoloop:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
