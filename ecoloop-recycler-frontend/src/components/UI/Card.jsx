import React from 'react';

/**
 * Card Component
 * Reusable card wrapper with consistent styling
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.variant] - Card variant (default, elevated, outlined)
 * @returns {JSX.Element} Card component
 *
 * @example
 * <Card>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </Card>
 */
const Card = ({ children, className = '', onClick, variant = 'default' }) => {
  const baseStyles = 'rounded-lg transition-all duration-200';

  const variantStyles = {
    default: 'bg-white border border-gray-200 hover:shadow-md',
    elevated: 'bg-white shadow-lg hover:shadow-xl',
    outlined: 'bg-transparent border-2 border-emerald-500 hover:bg-emerald-50',
  };

  const styles = `${baseStyles} ${variantStyles[variant] || variantStyles.default} ${className}`;

  return (
    <div className={styles} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : -1}>
      {children}
    </div>
  );
};

export default Card;
