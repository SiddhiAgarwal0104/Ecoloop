import { format, formatDistance, formatRelative } from 'date-fns';

/**
 * Formatting Utility Functions
 * Consistent data formatting across the application
 */

/**
 * Format number with commas
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format number to fixed decimal places
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatDecimal = (number, decimals = 2) => {
  if (number === null || number === undefined) return '0.00';
  return parseFloat(number).toFixed(decimals);
};

/**
 * Format number as percentage
 * @param {number} number - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (number, decimals = 1) => {
  if (number === null || number === undefined) return '0%';
  return `${parseFloat(number).toFixed(decimals)}%`;
};

/**
 * Format weight (kg)
 * @param {number} weight - Weight in kg
 * @returns {string} Formatted weight
 */
export const formatWeight = (weight) => {
  if (weight === null || weight === undefined) return '0 kg';
  return `${formatDecimal(weight)} kg`;
};

/**
 * Format weight to tons if > 1000 kg
 * @param {number} weight - Weight in kg
 * @returns {string} Formatted weight
 */
export const formatWeightAuto = (weight) => {
  if (weight === null || weight === undefined) return '0 kg';
  if (weight >= 1000) {
    return `${formatDecimal(weight / 1000)} tons`;
  }
  return `${formatDecimal(weight)} kg`;
};

/**
 * Format energy (kWh)
 * @param {number} energy - Energy in kWh
 * @returns {string} Formatted energy
 */
export const formatEnergy = (energy) => {
  if (energy === null || energy === undefined) return '0 kWh';
  return `${formatDecimal(energy)} kWh`;
};

/**
 * Format CO2 (kg)
 * @param {number} co2 - CO2 in kg
 * @returns {string} Formatted CO2
 */
export const formatCO2 = (co2) => {
  if (co2 === null || co2 === undefined) return '0 kg CO₂';
  return `${formatDecimal(co2)} kg CO₂`;
};

/**
 * Format date to readable format
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string (default: 'dd MMM yyyy')
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return '-';
  try {
    return format(new Date(date), formatStr);
  } catch (error) {
    console.error('Date format error:', error);
    return '-';
  }
};

/**
 * Format date to input format (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDateInput = (date) => {
  return formatDate(date, 'yyyy-MM-dd');
};

/**
 * Format date to display with time
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'dd MMM yyyy HH:mm');
};

/**
 * Format date to relative time (e.g., "2 days ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  try {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Relative time format error:', error);
    return '-';
  }
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
};

/**
 * Format email (lowercase, trim)
 * @param {string} email - Email
 * @returns {string} Formatted email
 */
export const formatEmail = (email) => {
  if (!email) return '-';
  return email.toLowerCase().trim();
};

/**
 * Format address
 * @param {object} address - Address object
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return '-';
  const parts = [
    address.street,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean);
  return parts.join(', ');
};

/**
 * Format currency (INR)
 * @param {number} amount - Amount
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0.00';
  return `₹${formatNumber(formatDecimal(amount))}`;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format rating (0-5 stars)
 * @param {number} rating - Rating value
 * @returns {string} Formatted rating
 */
export const formatRating = (rating) => {
  if (rating === null || rating === undefined) return '0.0';
  return `${parseFloat(rating).toFixed(1)} / 5.0`;
};

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Format waste type label
 * @param {string} wasteType - Waste type
 * @returns {string} Formatted label
 */
export const formatWasteType = (wasteType) => {
  const labels = {
    dry: 'Dry Waste',
    wet: 'Wet Waste',
    'e-waste': 'E-Waste',
  };
  return labels[wasteType] || wasteType;
};

/**
 * Format facility type label
 * @param {string} facilityType - Facility type
 * @returns {string} Formatted label
 */
export const formatFacilityType = (facilityType) => {
  if (!facilityType) return '-';
  return facilityType
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Format month-year from date string
 * @param {string} dateStr - Date string (YYYY-MM)
 * @returns {string} Formatted month-year
 */
export const formatMonthYear = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const [year, month] = dateStr.split('-');
    const date = new Date(year, month - 1);
    return format(date, 'MMM yyyy');
  } catch (error) {
    return dateStr;
  }
};

/**
 * Format growth percentage with sign
 * @param {number} growth - Growth percentage
 * @returns {string} Formatted growth
 */
export const formatGrowth = (growth) => {
  if (growth === null || growth === undefined) return '0%';
  const sign = growth >= 0 ? '+' : '';
  return `${sign}${formatPercentage(growth, 1)}`;
};

/**
 * Parse query params to object
 * @param {string} search - Query string
 * @returns {object} Params object
 */
export const parseQueryParams = (search) => {
  const params = new URLSearchParams(search);
  const result = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
};

/**
 * Object to query string
 * @param {object} obj - Object to convert
 * @returns {string} Query string
 */
export const objectToQueryString = (obj) => {
  return Object.keys(obj)
    .filter(key => obj[key] !== undefined && obj[key] !== null && obj[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
};

export default {
  formatNumber,
  formatDecimal,
  formatPercentage,
  formatWeight,
  formatWeightAuto,
  formatEnergy,
  formatCO2,
  formatDate,
  formatDateInput,
  formatDateTime,
  formatRelativeTime,
  formatPhone,
  formatEmail,
  formatAddress,
  formatCurrency,
  formatFileSize,
  formatRating,
  truncateText,
  capitalize,
  formatWasteType,
  formatFacilityType,
  formatMonthYear,
  formatGrowth,
  parseQueryParams,
  objectToQueryString,
};