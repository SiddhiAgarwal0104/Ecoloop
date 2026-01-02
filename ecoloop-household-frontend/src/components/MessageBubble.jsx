import React from 'react';

const MessageBubble = ({ sender, text, typing }) => (
  <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`px-4 py-2 rounded-2xl shadow-sm max-w-xs break-words ${
        sender === 'user'
          ? 'bg-eco-main text-white rounded-br-sm'
          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
      }`}
    >
      {typing ? <span className="typing-indicator">...</span> : text}
    </div>
  </div>
);

export default MessageBubble;
