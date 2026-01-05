import React from 'react';
import { X } from 'lucide-react';

/**
 * Modal Component
 * Reusable modal dialog with header, body, and footer
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Modal visibility state
 * @param {Function} props.onClose - Close handler
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} props.children - Modal body content
 * @param {React.ReactNode} [props.footer] - Modal footer content
 * @param {string} [props.size] - Modal size (sm, md, lg, xl)
 * @param {boolean} [props.closeButton] - Show close button
 * @returns {JSX.Element} Modal component
 *
 * @example
 * <Modal isOpen={isOpen} onClose={handleClose} title="Confirm Action">
 *   <p>Are you sure?</p>
 *   <div className="flex gap-2 mt-4">
 *     <Button onClick={handleClose}>Cancel</Button>
 *     <Button variant="danger" onClick={handleConfirm}>Confirm</Button>
 *   </div>
 * </Modal>
 */
const Modal = ({
  isOpen,
  onClose,
  title = '',
  children,
  footer = null,
  size = 'md',
  closeButton = true,
}) => {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`bg-white rounded-lg shadow-xl ${sizeStyles[size] || sizeStyles.md} w-full mx-4 max-h-screen overflow-y-auto`}>
        {/* Header */}
        {(title || closeButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && <h2 id="modal-title" className="text-lg font-bold text-gray-900">{title}</h2>}
            {closeButton && (
              <button
                onClick={onClose}
                className="ml-auto text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-200 p-6 flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
