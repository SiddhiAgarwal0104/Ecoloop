import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Alert Component
 * Dismissible alert with multiple severity levels
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.message - Alert message
 * @param {string} [props.type] - Alert type (success, error, warning, info)
 * @param {Function} [props.onClose] - Close handler
 * @param {boolean} [props.dismissible] - Show dismiss button
 * @param {React.ReactNode} [props.children] - Additional content
 * @returns {JSX.Element} Alert component
 *
 * @example
 * <Alert type="success" message="Operation completed successfully!" dismissible />
 */
const Alert = ({ message, type = 'info', onClose, dismissible = true, children }) => {
  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`${style.bg} border ${style.border} ${style.text} px-4 py-3 rounded-lg flex items-start gap-3`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {style.icon}
      </div>
      <div className="flex-1">
        {message && <p className="font-medium">{message}</p>}
        {children}
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
