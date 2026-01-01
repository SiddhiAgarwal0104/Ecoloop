/**
 * Utility functions for the EcoLoop Recycler Application
 */

/**
 * Format currency value
 * @param {number} value - Value to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(value);
};

/**
 * Format number with separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text with ellipsis
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return parseFloat(distance.toFixed(2));
};

/**
 * Get status badge color
 * @param {string} status - Status value
 * @returns {object} Color object with text and background
 */
export const getStatusColor = (status) => {
  const statusMap = {
    AVAILABLE: { text: 'text-green-700', bg: 'bg-green-100' },
    ACCEPTED: { text: 'text-yellow-700', bg: 'bg-yellow-100' },
    PICKED_UP: { text: 'text-blue-700', bg: 'bg-blue-100' },
    RECYCLED: { text: 'text-gray-700', bg: 'bg-gray-100' }
  };

  return statusMap[status] || { text: 'text-gray-700', bg: 'bg-gray-100' };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9\-\+\(\)\s]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with score and feedback
 */
export const validatePassword = (password) => {
  let score = 0;
  const feedback = [];

  if (!password) {
    return { score: 0, feedback: ['Password is required'] };
  }

  if (password.length >= 6) score++;
  else feedback.push('At least 6 characters');

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('At least one uppercase letter');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('At least one number');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('At least one special character');

  return { score, feedback };
};

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return 'NA';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Format time ago
 * @param {Date|string} date - Date to format
 * @returns {string} Time ago string
 */
export const formatTimeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString();
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Deep copy object
 * @param {object} obj - Object to copy
 * @returns {object} Deep copy
 */
export const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};
