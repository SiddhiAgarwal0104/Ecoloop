/**
 * Helper Utility Functions
 */

/**
 * Format date to readable string
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Calculate percentage
 */
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

/**
 * Round to 2 decimal places
 */
const roundToTwo = (num) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Generate random alphanumeric string
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (10 digits)
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate pincode (6 digits)
 */
const isValidPincode = (pincode) => {
  const pincodeRegex = /^[0-9]{6}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Calculate growth percentage
 */
const calculateGrowth = (current, previous) => {
  if (previous === 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(2);
};

/**
 * Sanitize user input (remove special characters)
 */
const sanitizeInput = (input) => {
  return input.replace(/[^\w\s@.-]/gi, '');
};

/**
 * Convert kg to tons
 */
const kgToTons = (kg) => {
  return (kg / 1000).toFixed(2);
};

/**
 * Convert grams to kg
 */
const gramsToKg = (grams) => {
  return (grams / 1000).toFixed(2);
};

/**
 * Calculate average
 */
const calculateAverage = (values) => {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return (sum / values.length).toFixed(2);
};

/**
 * Get date range for queries
 */
const getDateRange = (days) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return { startDate, endDate };
};

/**
 * Format number with commas (e.g., 1000 -> 1,000)
 */
const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Check if date is within range
 */
const isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return checkDate >= start && checkDate <= end;
};

/**
 * Get month name from number
 */
const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1];
};

/**
 * Truncate text to specified length
 */
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Convert object to query string
 */
const objectToQueryString = (obj) => {
  return Object.keys(obj)
    .filter(key => obj[key] !== undefined && obj[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
};

/**
 * Deep clone object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Sleep/delay function
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  formatDate,
  calculatePercentage,
  roundToTwo,
  generateRandomString,
  isValidEmail,
  isValidPhone,
  isValidPincode,
  calculateGrowth,
  sanitizeInput,
  kgToTons,
  gramsToKg,
  calculateAverage,
  getDateRange,
  formatNumberWithCommas,
  isDateInRange,
  getMonthName,
  truncateText,
  objectToQueryString,
  deepClone,
  isEmptyObject,
  sleep
};