import React from 'react';

/**
 * Button Component
 * Reusable button with multiple variants and sizes
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button text/content
 * @param {string} [props.variant] - Button variant (primary, secondary, danger, success)
 * @param {string} [props.size] - Button size (sm, md, lg)
 * @param {boolean} [props.disabled] - Disabled state
 * @param {boolean} [props.loading] - Loading state
 * @param {Function} props.onClick - Click handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.type] - Button type (button, submit, reset)
 * @returns {JSX.Element} Button component
 *
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Click Me
 * </Button>
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
    success: 'bg-green-600 text-white hover:bg-green-700 active:scale-95',
    ghost: 'bg-transparent text-emerald-600 hover:bg-emerald-50 active:scale-95',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const styles = `${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={styles}
      aria-busy={loading}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
