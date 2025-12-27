/**
 * Frontend Application Constants
 * Centralized configuration values
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/admin',
  TIMEOUT: 30000, // 30 seconds
};

// Waste Types
export const WASTE_TYPES = {
  DRY: 'dry',
  WET: 'wet',
  E_WASTE: 'e-waste',
};

export const WASTE_TYPE_LABELS = {
  dry: 'Dry Waste',
  wet: 'Wet Waste',
  'e-waste': 'E-Waste',
};

export const WASTE_TYPE_COLORS = {
  dry: '#4caf50',
  wet: '#66bb6a',
  'e-waste': '#81c784',
};

// Waste Status
export const WASTE_STATUS = {
  PENDING: 'pending',
  COLLECTED: 'collected',
  PROCESSED: 'processed',
  RECYCLED: 'recycled',
};

export const WASTE_STATUS_LABELS = {
  pending: 'Pending',
  collected: 'Collected',
  processed: 'Processed',
  recycled: 'Recycled',
};

// Admin Roles
export const ADMIN_ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

export const ADMIN_ROLE_LABELS = {
  admin: 'Admin',
  super_admin: 'Super Admin',
};

// Facility Types
export const FACILITY_TYPES = {
  RECYCLING_PLANT: 'recycling_plant',
  COMPOSTING_UNIT: 'composting_unit',
  E_WASTE_FACILITY: 'e-waste_facility',
  MIXED: 'mixed',
};

export const FACILITY_TYPE_LABELS = {
  recycling_plant: 'Recycling Plant',
  composting_unit: 'Composting Unit',
  'e-waste_facility': 'E-Waste Facility',
  mixed: 'Mixed Facility',
};

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 70,
  GOOD: 50,
  AVERAGE: 30,
  LOW: 0,
};

export const PERFORMANCE_LABELS = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  AVERAGE: 'Average',
  NEEDS_ATTENTION: 'Needs Attention',
};

export const PERFORMANCE_COLORS = {
  EXCELLENT: { bg: 'bg-green-100', text: 'text-green-700' },
  GOOD: { bg: 'bg-blue-100', text: 'text-blue-700' },
  AVERAGE: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  NEEDS_ATTENTION: { bg: 'bg-red-100', text: 'text-red-700' },
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: ['#4caf50', '#66bb6a', '#81c784', '#a5d6a7'],
  CO2: '#4caf50',
  ENERGY: '#ffc107',
  LANDFILL: '#2196f3',
  WASTE: '#66bb6a',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  ITEMS_PER_PAGE_OPTIONS: [10, 25, 50, 100],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  INPUT: 'yyyy-MM-dd',
  FULL: 'dd MMM yyyy HH:mm',
  MONTH_YEAR: 'MMM yyyy',
};

// Report Types
export const REPORT_TYPES = {
  WASTE_LOGS: 'waste-logs',
  LOCALITIES: 'localities',
  NGOS: 'ngos',
  RECYCLERS: 'recyclers',
  SUSTAINABILITY_IMPACT: 'sustainability-impact',
  LOCALITY_PERFORMANCE: 'locality-performance',
  NGO_PERFORMANCE: 'ngo-performance',
  RECYCLER_PERFORMANCE: 'recycler-performance',
};

export const REPORT_FORMAT = {
  CSV: 'csv',
  PDF: 'pdf',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'adminToken',
  ADMIN_DATA: 'adminData',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// API Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// Toast/Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Impact Calculation Factors
export const IMPACT_FACTORS = {
  CO2_PER_TREE_YEARLY: 21, // kg CO2 absorbed by one tree per year
  ENERGY_PER_HOME_YEARLY: 10950, // kWh consumed by average home per year
  WASTE_PER_TRUCK: 5000, // kg waste capacity per truck
};

// Time Ranges
export const TIME_RANGES = {
  LAST_WEEK: 7,
  LAST_MONTH: 30,
  LAST_3_MONTHS: 90,
  LAST_6_MONTHS: 180,
  LAST_YEAR: 365,
};

export const TIME_RANGE_LABELS = {
  7: 'Last Week',
  30: 'Last Month',
  90: 'Last 3 Months',
  180: 'Last 6 Months',
  365: 'Last Year',
};

// App Metadata
export const APP_META = {
  NAME: 'EcoLoop Admin',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sustainable Waste Management Platform',
  AUTHOR: 'Nihira',
};

// Regex Patterns
export const PATTERNS = {
  EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  PHONE: /^[0-9]{10}$/,
  PINCODE: /^[0-9]{6}$/,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized. Please login again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NOT_FOUND: 'Requested resource not found.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logout successful!',
  UPDATE: 'Updated successfully!',
  DELETE: 'Deleted successfully!',
  DOWNLOAD: 'Report downloaded successfully!',
};

export default {
  API_CONFIG,
  WASTE_TYPES,
  WASTE_STATUS,
  ADMIN_ROLES,
  FACILITY_TYPES,
  PERFORMANCE_THRESHOLDS,
  CHART_COLORS,
  PAGINATION,
  DATE_FORMATS,
  REPORT_TYPES,
  STORAGE_KEYS,
  STATUS_CODES,
  NOTIFICATION_TYPES,
  IMPACT_FACTORS,
  TIME_RANGES,
  APP_META,
  PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};