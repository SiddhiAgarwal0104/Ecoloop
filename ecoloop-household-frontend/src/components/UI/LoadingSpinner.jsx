import React from 'react';

/**
 * Loading Spinner Component
 * Animated spinner for loading states
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.size] - Spinner size (sm, md, lg)
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.text] - Loading text
 * @returns {JSX.Element} Spinner component
 *
 * @example
 * <LoadingSpinner size="md" text="Loading..." />
 */
const LoadingSpinner = ({ size = 'md', className = '', text = '' }) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${sizeStyles[size]} border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin`} />
      {text && <p className="text-gray-600 text-sm font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
