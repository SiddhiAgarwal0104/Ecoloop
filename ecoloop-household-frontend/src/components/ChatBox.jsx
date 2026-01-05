import React from 'react';
import MessageBubble from './MessageBubble';

const ChatBox = ({ messages, loading, error, chatEndRef }) => (
  <div className="flex flex-col gap-2 pb-2" style={{ minHeight: 320 }}>
    {messages.map((msg, idx) => (
      <MessageBubble key={idx} sender={msg.sender} text={msg.text} />
    ))}
    {loading && <MessageBubble sender="bot" text="AI Waste Coach is typing..." typing />}
    {error && <div className="text-red-500 text-sm px-2">{error}</div>}
    <div ref={chatEndRef} />
  </div>
);

export default ChatBox;
