/**
 * Validation Utility Functions
 * Input validation and error handling
 */

import { PATTERNS } from './constants';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  return PATTERNS.EMAIL.test(email);
};

/**
 * Validate phone number (10 digits)
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  return PATTERNS.PHONE.test(phone);
};

/**
 * Validate pincode (6 digits)
 * @param {string} pincode - Pincode to validate
 * @returns {boolean} Is valid
 */
export const isValidPincode = (pincode) => {
  if (!pincode) return false;
  return PATTERNS.PINCODE.test(pincode);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }

  if (password.length > 50) {
    return { isValid: false, message: 'Password must not exceed 50 characters' };
  }

  return { isValid: true, message: 'Password is valid' };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {object} Validation result
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field name
 * @returns {object} Validation result
 */
export const validateRange = (value, min, max, fieldName = 'Value') => {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} must be a number` };
  }

  if (num < min) {
    return { isValid: false, message: `${fieldName} must be at least ${min}` };
  }

  if (num > max) {
    return { isValid: false, message: `${fieldName} must not exceed ${max}` };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {object} Validation result
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { isValid: false, message: 'Both start and end dates are required' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, message: 'Invalid date format' };
  }

  if (start > end) {
    return { isValid: false, message: 'Start date must be before end date' };
  }

  // Check if date range is not too large (max 1 year)
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  if (end - start > oneYear) {
    return { isValid: false, message: 'Date range cannot exceed 1 year' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Allowed MIME types
 * @returns {object} Validation result
 */
export const validateFileType = (file, allowedTypes = []) => {
  if (!file) {
    return { isValid: false, message: 'File is required' };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: `File type must be one of: ${allowedTypes.join(', ')}`,
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeInMB - Maximum size in MB
 * @returns {object} Validation result
 */
export const validateFileSize = (file, maxSizeInMB = 5) => {
  if (!file) {
    return { isValid: false, message: 'File is required' };
  }

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      message: `File size must not exceed ${maxSizeInMB}MB`,
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid
 */
export const isValidURL = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate form data
 * @param {object} data - Form data
 * @param {object} rules - Validation rules
 * @returns {object} Validation result
 */
export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = data[field];

    // Required validation
    if (rule.required) {
      const result = validateRequired(value, rule.label || field);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
        return;
      }
    }

    // Email validation
    if (rule.email && value) {
      if (!isValidEmail(value)) {
        errors[field] = `${rule.label || field} must be a valid email`;
        isValid = false;
        return;
      }
    }

    // Phone validation
    if (rule.phone && value) {
      if (!isValidPhone(value)) {
        errors[field] = `${rule.label || field} must be a valid 10-digit phone number`;
        isValid = false;
        return;
      }
    }

    // Min length validation
    if (rule.minLength && value) {
      if (value.length < rule.minLength) {
        errors[field] = `${rule.label || field} must be at least ${rule.minLength} characters`;
        isValid = false;
        return;
      }
    }

    // Max length validation
    if (rule.maxLength && value) {
      if (value.length > rule.maxLength) {
        errors[field] = `${rule.label || field} must not exceed ${rule.maxLength} characters`;
        isValid = false;
        return;
      }
    }

    // Custom validation
    if (rule.custom && value) {
      const result = rule.custom(value);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
        return;
      }
    }
  });

  return { isValid, errors };
};

/**
 * Sanitize string input (remove special characters)
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  return input.replace(/[^\w\s@.-]/gi, '');
};

/**
 * Check if string contains only alphanumeric characters
 * @param {string} str - String to check
 * @returns {boolean} Is alphanumeric
 */
export const isAlphanumeric = (str) => {
  if (!str) return false;
  return /^[a-zA-Z0-9]+$/.test(str);
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} Validation result
 */
export const validatePagination = (page, limit) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    return { isValid: false, message: 'Page must be a positive number' };
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return { isValid: false, message: 'Limit must be between 1 and 100' };
  }

  return { isValid: true, message: '' };
};

export default {
  isValidEmail,
  isValidPhone,
  isValidPincode,
  validatePassword,
  validateRequired,
  validateRange,
  validateDateRange,
  validateFileType,
  validateFileSize,
  isValidURL,
  validateForm,
  sanitizeInput,
  isAlphanumeric,
  validatePagination,
};