/**
 * Custom Error Class for API Error Handling
 * Extends Error to provide consistent error response structure
 */

class AppError extends Error {
  /**
   * Create an AppError instance
   * @param {string} message - Error message to display
   * @param {number} statusCode - HTTP status code
   * @example
   * throw new AppError('User not found', 404);
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Capture stack trace (excludes constructor call from stack)
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Check if error is an operational error (safe to send to client)
   * @returns {boolean}
   */
  isOperational() {
    return true;
  }

  /**
   * Convert error to JSON response format
   * @returns {object}
   */
  toJSON() {
    return {
      success: false,
      error: this.message,
      statusCode: this.statusCode
    };
  }
}

module.exports = AppError;
