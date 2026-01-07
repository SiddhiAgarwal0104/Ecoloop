/**
 * Constants used throughout the EcoLoop Recycler Application
 */

// Waste Categories with details
export const WASTE_CATEGORIES = {
  PLASTIC: {
    name: 'Plastic',
    icon: '🥤',
    color: '#ef4444',
    description: 'Plastic bottles, bags, containers'
  },
  PAPER: {
    name: 'Paper',
    icon: '📰',
    color: '#f59e0b',
    description: 'Newspapers, magazines, cardboard'
  },
  METAL: {
    name: 'Metal',
    icon: '🔩',
    color: '#6b7280',
    description: 'Aluminum cans, steel items'
  },
  GLASS: {
    name: 'Glass',
    icon: '🍾',
    color: '#06b6d4',
    description: 'Glass bottles, jars'
  },
  E_WASTE: {
    name: 'E-Waste',
    icon: '💻',
    color: '#8b5cf6',
    description: 'Electronics, batteries'
  },
  ORGANIC: {
    name: 'Organic',
    icon: '🍃',
    color: '#10b981',
    description: 'Food waste, composting materials'
  },
  MIXED: {
    name: 'Mixed',
    icon: '♻️',
    color: '#3b82f6',
    description: 'Multiple waste types'
  }
};

// Waste Types
export const WASTE_TYPES = {
  SEGREGATED: 'Segregated',
  MIXED: 'Mixed'
};

// Units of Measurement
export const UNITS = {
  KG: 'Kilogram (KG)',
  PIECES: 'Pieces',
  ITEMS: 'Items',
  BAGS: 'Bags'
};

// Request Status with colors and descriptions
export const REQUEST_STATUS = {
  AVAILABLE: {
    label: 'Available',
    color: '#10b981',
    bgColor: '#d1fae5',
    description: 'Ready for pickup',
    icon: '✅'
  },
  ACCEPTED: {
    label: 'Accepted',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    description: 'Recycler assigned',
    icon: '🤝'
  },
  PICKED_UP: {
    label: 'Picked Up',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    description: 'In transit to facility',
    icon: '🚚'
  },
  RECYCLED: {
    label: 'Recycled',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    description: 'Processing complete',
    icon: '✨'
  }
};

// Navigation Links for Sidebar
export const NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/requests', label: 'Available Requests', icon: '🔍' },
  { path: '/accepted-requests', label: 'My Requests', icon: '✅' },
  { path: '/statistics', label: 'Statistics', icon: '📈' },
  { path: '/profile', label: 'Profile', icon: '👤' }
];

// API Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Your session has expired. Please login again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful! Welcome back.',
  REGISTER_SUCCESS: 'Registration successful! You can now login.',
  REQUEST_ACCEPTED: 'Request accepted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  STATUS_UPDATED: 'Status updated successfully!'
};

// Validation Rules
export const VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  phone: {
    pattern: /^[0-9\-\+\(\)\s]{10,}$/,
    message: 'Please enter a valid phone number'
  },
  password: {
    minLength: 6,
    message: 'Password must be at least 6 characters'
  },
  name: {
    minLength: 2,
    maxLength: 50,
    message: 'Name must be between 2 and 50 characters'
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile'
  },

  // Requests
  REQUESTS: {
    GET_AVAILABLE: '/requests/available',
    GET_NEARBY: '/requests/nearby',
    ACCEPT: '/requests/:id/accept',
    GET_MY: '/requests/my',
    UPDATE_STATUS: '/requests/:id/status',
    GET_DETAILS: '/requests/:id'
  },

  // Dashboard
  DASHBOARD: {
    GET_DATA: '/dashboard',
    GET_PERFORMANCE: '/dashboard/performance'
  }
};

// Sorting Options
export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  DISTANCE: 'distance',
  QUANTITY: 'quantity'
};

// Validation Rules (alias for VALIDATION)
export const VALIDATION_RULES = VALIDATION;
