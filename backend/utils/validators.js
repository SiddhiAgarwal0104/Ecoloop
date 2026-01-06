const { body, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validation rules for creating request
 */
exports.createRequestValidation = [
  body('itemName')
    .trim()
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ max: 100 })
    .withMessage('Item name cannot exceed 100 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Electronics',
      'Tools',
      'Sports',
      'Books',
      'Furniture',
      'Vehicles',
      'Clothing',
      'Kitchen',
      'Garden',
      'Other',
    ])
    .withMessage('Invalid category'),
  body('locality').trim().notEmpty().withMessage('Locality is required'),
  body('pincode')
    .trim()
    .notEmpty()
    .withMessage('Pincode is required')
    .matches(/^\d{6}$/)
    .withMessage('Invalid pincode format'),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601(),
  body('endDate').notEmpty().withMessage('End date is required').isISO8601(),
  body('paymentType')
    .notEmpty()
    .withMessage('Payment type is required')
    .isIn(['Free', 'Paid'])
    .withMessage('Invalid payment type'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
];

/**
 * Validation rules for sending message
 */
exports.sendMessageValidation = [
  body('content').trim().notEmpty().withMessage('Message content is required'),
  body('type')
    .optional()
    .isIn(['text', 'image'])
    .withMessage('Invalid message type'),
];