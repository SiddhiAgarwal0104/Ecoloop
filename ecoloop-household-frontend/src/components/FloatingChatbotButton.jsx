import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Modal from './Modal';
import ChatPage from '../pages/ChatPage';

const FloatingChatbotButton = () => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-eco-main hover:bg-green-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-colors duration-200"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Open AI Waste Coach"
      >
        <MessageCircle size={28} />
        {hovered && (
          <span className="ml-3 px-3 py-1 bg-white text-eco-main rounded shadow text-sm font-semibold transition-all duration-200">
            AI Waste Coach
          </span>
        )}
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ChatPage />
      </Modal>
    </>
  );
};

export default FloatingChatbotButton;
