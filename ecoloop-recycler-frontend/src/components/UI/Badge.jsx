import React from 'react';

/**
 * Badge Component
 * Status badge with multiple variants and colors
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} [props.variant] - Badge variant (primary, success, warning, danger, info)
 * @param {string} [props.size] - Badge size (sm, md, lg)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Badge component
 *
 * @example
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning">Pending</Badge>
 */
const Badge = ({ children, variant = 'primary', size = 'md', className = '' }) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variantStyles = {
    primary: 'bg-emerald-100 text-emerald-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const styles = `${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`;

  return <span className={styles}>{children}</span>;
};

export default Badge;
