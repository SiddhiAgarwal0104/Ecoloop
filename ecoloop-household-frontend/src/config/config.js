/**
 * EcoLoop Recycler - Environment Configuration
 * Centralized configuration management for different environments
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'X-Client': 'EcoLoop-Recycler',
      'X-Client-Version': '1.0.0'
    }
  },

  // Authentication Configuration
  auth: {
    tokenKey: 'recycler_token',
    userKey: 'recycler_user',
    tokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    refreshTokenKey: 'recycler_refresh_token'
  },

  // Map Configuration (for future map features)
  map: {
    defaultZoom: 15,
    defaultCenter: { lat: 28.6139, lng: 77.2090 }, // Default: Delhi, India
    maxZoom: 20,
    minZoom: 3,
    markerIcon: '📍',
    recyclerMarkerIcon: '♻️'
  },

  // Request Configuration
  requests: {
    // Status options
    statuses: ['AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'RECYCLED'],
    defaultStatus: 'AVAILABLE',
    
    // Waste categories
    categories: ['PLASTIC', 'PAPER', 'METAL', 'GLASS', 'E_WASTE', 'ORGANIC', 'MIXED'],
    
    // Units
    units: ['KG', 'PIECES', 'ITEMS', 'BAGS'],
    defaultUnit: 'KG',

    // Radius for nearby requests (in km)
    searchRadius: 10,
    maxSearchRadius: 50
  },

  // UI Configuration
  ui: {
    // Pagination
    itemsPerPage: 10,
    
    // Loading timeout
    loadingTimeout: 30000,
    
    // Toast/Notification duration (in ms)
    notificationDuration: 3000,
    
    // Date format
    dateFormat: 'MMM dd, yyyy',
    dateTimeFormat: 'MMM dd, yyyy hh:mm a'
  },

  // Feature Flags
  features: {
    enableMapView: true,
    enableLiveTracking: true,
    enableNotifications: true,
    enableRatings: true,
    enableAnalytics: !isDevelopment
  },

  // Logging Configuration
  logging: {
    enabled: true,
    level: isDevelopment ? 'debug' : 'info',
    logRequests: isDevelopment,
    logResponses: isDevelopment,
    logErrors: true
  },

  // Environment
  environment: {
    isDevelopment,
    isProduction,
    nodeEnv: import.meta.env.MODE
  }
};

export default config;
