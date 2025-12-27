/**
 * Application Constants
 * Centralized configuration values
 */

// Waste Types
const WASTE_TYPES = {
  DRY: 'dry',
  WET: 'wet',
  E_WASTE: 'e-waste'
};

// Waste Status
const WASTE_STATUS = {
  PENDING: 'pending',
  COLLECTED: 'collected',
  PROCESSED: 'processed',
  RECYCLED: 'recycled'
};

// Admin Roles
const ADMIN_ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Facility Types
const FACILITY_TYPES = {
  RECYCLING_PLANT: 'recycling_plant',
  COMPOSTING_UNIT: 'composting_unit',
  E_WASTE_FACILITY: 'e-waste_facility',
  MIXED: 'mixed'
};

// Material Types
const MATERIAL_TYPES = {
  PLASTIC: 'plastic',
  PAPER: 'paper',
  METAL: 'metal',
  GLASS: 'glass',
  ORGANIC: 'organic',
  ELECTRONICS: 'electronics',
  BATTERIES: 'batteries',
  MIXED: 'mixed'
};

// Impact Calculation Factors
const IMPACT_FACTORS = {
  CO2_SAVED: {
    dry: 0.8,      // kg CO2 per kg waste
    wet: 0.3,
    'e-waste': 1.5
  },
  ENERGY_SAVED: {
    dry: 1.2,      // kWh per kg waste
    wet: 0.5,
    'e-waste': 2.0
  },
  LANDFILL_REDUCTION: 1.0  // Direct 1:1 ratio
};

// Environmental Equivalents
const ENVIRONMENTAL_EQUIVALENTS = {
  CO2_PER_TREE_YEARLY: 21,        // kg CO2 absorbed by one tree per year
  ENERGY_PER_HOME_YEARLY: 10950,  // kWh consumed by average home per year
  WASTE_PER_TRUCK: 5000           // kg waste capacity per truck
};

// Report Types
const REPORT_TYPES = {
  WASTE_LOGS: 'waste-logs',
  LOCALITIES: 'localities',
  NGOS: 'ngos',
  RECYCLERS: 'recyclers',
  SUSTAINABILITY_IMPACT: 'sustainability-impact',
  LOCALITY_PERFORMANCE: 'locality-performance',
  NGO_PERFORMANCE: 'ngo-performance',
  RECYCLER_PERFORMANCE: 'recycler-performance'
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Date Ranges
const DATE_RANGES = {
  LAST_WEEK: 7,
  LAST_MONTH: 30,
  LAST_3_MONTHS: 90,
  LAST_6_MONTHS: 180,
  LAST_YEAR: 365
};

// Performance Thresholds
const PERFORMANCE_THRESHOLDS = {
  HIGH_PARTICIPATION: 70,    // % participation rate
  LOW_PARTICIPATION: 30,     // % participation rate
  HIGH_WASTE_AVG: 10,        // kg average waste per log
  LOW_RATING: 3,             // star rating
  HIGH_RESPONSE_TIME: 48,    // hours
  CAPACITY_UTILIZATION_LOW: 50  // % capacity utilization
};

// API Response Messages
const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful',
    LOGOUT: 'Logout successful',
    REGISTER: 'Admin registered successfully',
    UPDATE: 'Updated successfully',
    DELETE: 'Deleted successfully',
    FETCH: 'Data fetched successfully'
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid credentials',
    UNAUTHORIZED: 'Not authorized to access this route',
    NOT_FOUND: 'Resource not found',
    SERVER_ERROR: 'Server error',
    VALIDATION_ERROR: 'Validation error',
    DUPLICATE: 'Resource already exists',
    INACTIVE_ACCOUNT: 'Account has been deactivated'
  }
};

// Status Codes
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

module.exports = {
  WASTE_TYPES,
  WASTE_STATUS,
  ADMIN_ROLES,
  FACILITY_TYPES,
  MATERIAL_TYPES,
  IMPACT_FACTORS,
  ENVIRONMENTAL_EQUIVALENTS,
  REPORT_TYPES,
  PAGINATION,
  DATE_RANGES,
  PERFORMANCE_THRESHOLDS,
  MESSAGES,
  STATUS_CODES
};