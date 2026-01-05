import React from 'react';

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black bg-opacity-30">
      <div className="w-full max-w-sm m-8 rounded-2xl shadow-2xl relative animate-slideIn flex flex-col" style={{background: 'linear-gradient(135deg, #f8fafc 80%, #e0e7ff 100%)'}}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 rounded-t-2xl bg-eco-main text-white">
          <div className="flex items-center gap-2">
            <span className="bg-white text-eco-main rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">🤖</span>
            <div>
              <div className="font-semibold leading-tight">AI Waste Coach</div>
              <div className="text-xs text-green-200">We reply immediately</div>
            </div>
          </div>
          <button
            className="text-white text-2xl font-bold hover:text-red-300 transition-colors"
            onClick={onClose}
            aria-label="Close chatbot"
          >
            ×
          </button>
        </div>
        {/* Chat Body */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{minHeight: 400, maxHeight: 520}}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
