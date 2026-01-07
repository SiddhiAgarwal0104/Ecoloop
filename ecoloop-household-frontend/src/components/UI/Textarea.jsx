import React from 'react';

/**
 * Textarea Component
 * Controlled textarea with validation states
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.value - Textarea value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.label] - Label text
 * @param {boolean} [props.disabled] - Disabled state
 * @param {string} [props.error] - Error message
 * @param {number} [props.rows] - Number of rows
 * @param {number} [props.maxLength] - Maximum character length
 * @param {boolean} [props.required] - Required field indicator
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Textarea component
 *
 * @example
 * <Textarea
 *   label="Description"
 *   placeholder="Enter description..."
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 *   rows={4}
 * />
 */
const Textarea = React.forwardRef(({
  value,
  onChange,
  placeholder = '',
  label = '',
  disabled = false,
  error = '',
  rows = 4,
  maxLength,
  required = false,
  className = '',
  ...rest
}, ref) => {
  const textareaStyles = `
    w-full px-4 py-2 border rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
    resize-vertical
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={textareaStyles}
        aria-invalid={error ? 'true' : 'false'}
        {...rest}
      />
      <div className="flex items-center justify-between mt-1">
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {maxLength && (
          <p className="text-sm text-gray-500 ml-auto">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
