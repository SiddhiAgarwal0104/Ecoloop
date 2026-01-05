import React, { useState, useRef, useEffect } from 'react';
import ChatBox from '../components/ChatBox';
import ChatInput from '../components/ChatInput';
import '../index.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text, imageFile) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('message', text);
      if (imageFile) formData.append('image', imageFile);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chatbot error');
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text },
        { sender: 'bot', text: data.reply },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ minHeight: 400, maxHeight: 520 }}>
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-white" style={{borderRadius: '0 0 1rem 1rem'}}>
        <ChatBox messages={messages} loading={loading} error={error} chatEndRef={chatEndRef} />
      </div>
      <div className="p-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
        <ChatInput onSend={sendMessage} loading={loading} />
      </div>
    </div>
  );
};

export default ChatPage;
