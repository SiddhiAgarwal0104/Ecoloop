import React, { useState } from 'react';

const ChatInput = ({ onSend, loading }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    onSend(text, image);
    setText('');
    setImage(null);
  };

  return (
    <form className="flex gap-2 items-center" onSubmit={handleSend}>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type your message..."
        disabled={loading}
        className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eco-main bg-white shadow-sm"
      />
      <input
        type="file"
        accept="image/*"
        onChange={e => setImage(e.target.files[0])}
        disabled={loading}
        className="hidden"
        id="chat-image-upload"
      />
      <label htmlFor="chat-image-upload" className="cursor-pointer px-3 py-2 bg-gray-100 rounded-full border border-gray-300 hover:bg-gray-200 text-gray-600 text-sm">
        📎
      </label>
      <button type="submit" disabled={loading || (!text.trim() && !image)}
        className="px-4 py-2 bg-eco-main text-white rounded-full font-semibold shadow hover:bg-green-700 transition-colors disabled:opacity-50">
        Send
      </button>
    </form>
  );
};

export default ChatInput;
