import React from 'react';

/**
 * Input Component
 * Controlled text input with validation states
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.type] - Input type (text, email, password, number, etc.)
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.label] - Label text
 * @param {boolean} [props.disabled] - Disabled state
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.required] - Required field indicator
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.rest] - Other HTML input attributes
 * @returns {JSX.Element} Input component
 *
 * @example
 * <Input
 *   type="email"
 *   label="Email"
 *   placeholder="user@example.com"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error={emailError}
 * />
 */
const Input = React.forwardRef(({
  value,
  onChange,
  type = 'text',
  placeholder = '',
  label = '',
  disabled = false,
  error = '',
  required = false,
  className = '',
  ...rest
}, ref) => {
  const inputStyles = `
    w-full px-4 py-2 border rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
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
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={inputStyles}
        aria-invalid={error ? 'true' : 'false'}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
