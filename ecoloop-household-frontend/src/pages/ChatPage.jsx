import React, { useState, useRef, useEffect } from 'react';
import ChatBox from '../components/ChatBox';
import ChatInput from '../components/ChatInput';
import api from '../services/api';
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
      
      console.log('🚀 Sending message to chatbot:', text);
      console.log('📍 API URL:', api.defaults.baseURL + '/chatbot/message');
      
      const res = await api.post('/chatbot/message', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Chatbot response:', res.data);
      
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text },
        { sender: 'bot', text: res.data.reply },
      ]);
    } catch (err) {
      console.error('❌ Chatbot error:', err);
      setError(err.response?.data?.error || err.message || 'Chatbot error');
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
