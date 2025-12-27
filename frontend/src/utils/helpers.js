/**
 * Helper Utility Functions
 * General-purpose helper functions
 */

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

/**
 * Calculate growth percentage
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Growth percentage
 */
export const calculateGrowth = (current, previous) => {
  if (previous === 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(2);
};

/**
 * Get performance badge based on rate
 * @param {number} rate - Participation rate
 * @returns {object} Badge configuration
 */
export const getPerformanceBadge = (rate) => {
  if (rate >= 70) {
    return { bg: 'bg-green-100', text: 'text-green-700', label: 'Excellent' };
  }
  if (rate >= 50) {
    return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Good' };
  }
  if (rate >= 30) {
    return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Average' };
  }
  return { bg: 'bg-red-100', text: 'text-red-700', label: 'Needs Attention' };
};

/**
 * Get status badge configuration
 * @param {boolean} isActive - Is active
 * @param {boolean} isVerified - Is verified
 * @returns {object} Badge configuration
 */
export const getStatusBadge = (isActive, isVerified) => {
  if (!isActive) {
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: 'Inactive',
    };
  }
  if (!isVerified) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Pending',
    };
  }
  return {
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: 'Verified',
  };
};

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} Is empty
 */
export const isEmptyObject = (obj) => {
  return Object.keys(obj || {}).length === 0;
};

/**
 * Debounce function
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after ms
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Generate random string
 * @param {number} length - String length
 * @returns {string} Random string
 */
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Get date range for queries
 * @param {number} days - Number of days
 * @returns {object} Date range
 */
export const getDateRange = (days) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return { startDate, endDate };
};

/**
 * Sort array of objects by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortByKey = (array, key, order = 'asc') => {
  return array.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Group array of objects by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {object} Grouped object
 */
export const groupByKey = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Filter array by search query
 * @param {Array} array - Array to filter
 * @param {string} query - Search query
 * @param {Array} keys - Keys to search in
 * @returns {Array} Filtered array
 */
export const filterBySearch = (array, query, keys) => {
  if (!query) return array;

  const lowerQuery = query.toLowerCase();

  return array.filter((item) => {
    return keys.some((key) => {
      const value = item[key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery);
      }
      return false;
    });
  });
};

/**
 * Download file from blob
 * @param {Blob} blob - File blob
 * @param {string} filename - File name
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Check if user is on mobile device
 * @returns {boolean} Is mobile
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Get browser name
 * @returns {string} Browser name
 */
export const getBrowserName = () => {
  const userAgent = navigator.userAgent;

  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'IE';

  return 'Unknown';
};

/**
 * Convert RGB to Hex color
 * @param {number} r - Red
 * @param {number} g - Green
 * @param {number} b - Blue
 * @returns {string} Hex color
 */
export const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Get contrast color (black or white) for background
 * @param {string} hexColor - Background color in hex
 * @returns {string} Contrast color
 */
export const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

/**
 * Calculate average of array
 * @param {Array<number>} numbers - Array of numbers
 * @returns {number} Average
 */
export const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return (sum / numbers.length).toFixed(2);
};

/**
 * Get unique values from array
 * @param {Array} array - Array with duplicates
 * @returns {Array} Array with unique values
 */
export const getUniqueValues = (array) => {
  return [...new Set(array)];
};

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Chunked array
 */
export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export default {
  calculatePercentage,
  calculateGrowth,
  getPerformanceBadge,
  getStatusBadge,
  deepClone,
  isEmptyObject,
  debounce,
  throttle,
  sleep,
  generateRandomString,
  getDateRange,
  sortByKey,
  groupByKey,
  filterBySearch,
  downloadFile,
  copyToClipboard,
  isMobile,
  getBrowserName,
  rgbToHex,
  getContrastColor,
  calculateAverage,
  getUniqueValues,
  chunkArray,
};