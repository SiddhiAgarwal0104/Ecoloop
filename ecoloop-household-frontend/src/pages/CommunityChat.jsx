import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CommunityChat = () => {
  const navigate = useNavigate();
  const { chatRoomId } = useParams();
  const { user } = useAuth();

  const [chatRoom, setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch chat room and messages
  useEffect(() => {
    fetchChatRoomAndMessages();
  }, [chatRoomId]);

  const fetchChatRoomAndMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch chat room details
      const chatRes = await api.get(`/chat/room-by-id/${chatRoomId}`);
      setChatRoom(chatRes.data.data);

      // Fetch messages
      const messagesRes = await api.get(`/chat/${chatRoomId}/messages`);
      setMessages(messagesRes.data.data || []);
    } catch (err) {
      console.error('Error fetching chat:', err);
      setError(err.response?.data?.message || 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    try {
      setSending(true);

      const response = await api.post(`/chat/${chatRoomId}/message`, {
        content: messageText,
      });

      setMessages((prev) => [...prev, response.data.data]);
      setMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-eco-main" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/community/requests')}
            className="px-4 py-2 bg-eco-main text-white rounded-lg hover:bg-eco-dark transition"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Chat room not found</p>
      </div>
    );
  }

  // Find the other participant (not current user)
  const otherParticipant = chatRoom.participants?.find((p) => p._id !== user.id);
  const participantName = otherParticipant?.name || 'User';

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-eco-main text-white p-4 flex items-center gap-3 shadow-md">
        <button
          onClick={() => navigate('/community/requests')}
          className="hover:bg-eco-dark p-2 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-lg font-semibold">{participantName}</h2>
          <p className="text-eco-light text-sm">
            {chatRoom.requestId?.itemName || 'Chat'}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg._id || index}
              className={`flex ${msg.senderId._id === user.id || msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId._id === user.id || msg.senderId === user.id
                    ? 'bg-eco-main text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-eco-main"
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="bg-eco-main text-white p-3 rounded-lg hover:bg-eco-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunityChat;
