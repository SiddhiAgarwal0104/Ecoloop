import React from 'react';

/**
 * Select Component
 * Controlled select input with label and error states
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array<{value: string, label: string}>} props.options - Select options
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.label] - Label text
 * @param {boolean} [props.disabled] - Disabled state
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.required] - Required field indicator
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Select component
 *
 * @example
 * <Select
 *   label="Category"
 *   value={category}
 *   onChange={(e) => setCategory(e.target.value)}
 *   options={[
 *     { value: 'plastic', label: 'Plastic' },
 *     { value: 'metal', label: 'Metal' }
 *   ]}
 * />
 */
const Select = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label = '',
  disabled = false,
  error = '',
  required = false,
  className = '',
}) => {
  const selectStyles = `
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
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={selectStyles}
        aria-invalid={error ? 'true' : 'false'}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Select;
