import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader, Image as ImageIcon, X, Check, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CommunityChat = () => {
  const navigate = useNavigate();
  const { chatRoomId } = useParams(); // This is the chatRoomId from URL
  const { user } = useAuth();

  const [chatRoom, setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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

      console.log('🔍 Fetching chat room with ID:', chatRoomId);
      
      // First try to treat it as a request ID (for existing negotiations)
      let chatRes;
      try {
        console.log('📝 Trying request ID endpoint...');
        chatRes = await api.get(`/chat/room/${chatRoomId}`);
      } catch (err) {
        // If that fails, try treating it as a chat room ID (for direct navigation)
        if (err.response?.status === 404) {
          console.log('🔄 Request ID not found, trying chat room ID endpoint...');
          chatRes = await api.get(`/chat/room-by-id/${chatRoomId}`);
        } else {
          throw err;
        }
      }
      
      if (!chatRes.data.data) {
        throw new Error('Chat room data is empty');
      }
      
      setChatRoom(chatRes.data.data);

      // Fetch messages using the actual chat room ID
      const messagesRes = await api.get(`/chat/${chatRes.data.data._id}/messages`);
      setMessages(messagesRes.data.data || []);
      
      console.log('✅ Chat room and messages loaded successfully');
    } catch (err) {
      console.error('❌ Error fetching chat:', err);
      console.error('Response details:', err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load chat room';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() && !selectedImage) return;
    if (!chatRoom) return;

    try {
      setSending(true);

      // Send text message
      if (messageText.trim()) {
        const response = await api.post(`/chat/${chatRoom._id}/message`, {
          content: messageText,
        });
        setMessages((prev) => [...prev, response.data.data]);
      }

      // Send image message
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);

        const imageResponse = await api.post(
          `/chat/${chatRoom._id}/image`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        setMessages((prev) => [...prev, imageResponse.data.data]);
        setSelectedImage(null);
      }

      setMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    } else {
      setError('Please select a valid image file');
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmation = async (type) => {
    if (!chatRoom) return;

    try {
      setConfirming(true);
      const endpoint = type === 'lend' ? '/confirm-lend' : '/confirm-borrow';
      
      const response = await api.post(`/chat/${chatRoom._id}${endpoint}`);
      
      // Update chat room with new confirmation status
      setChatRoom(response.data.data);
      setError(null);
    } catch (err) {
      console.error(`Error confirming ${type}:`, err);
      setError(err.response?.data?.message || `Failed to confirm ${type}`);
    } finally {
      setConfirming(false);
    }
  };

  // Determine user's role in the chat
  const getUserRole = () => {
    const userParticipant = chatRoom?.participants?.find(
      (p) => p.userId._id === user.id || p.userId === user.id
    );
    return userParticipant?.role;
  };

  // Check confirmation status
  const getConfirmationStatus = () => {
    const userRole = getUserRole();
    
    if (chatRoom?.lenderConfirmed && chatRoom?.borrowerConfirmed) {
      return 'CONFIRMED';
    }
    if (chatRoom?.status === 'CONFIRMED') {
      return 'CONFIRMED';
    }
    if (chatRoom?.lenderConfirmed || chatRoom?.borrowerConfirmed) {
      return 'PARTIALLY_CONFIRMED';
    }
    return 'IN_NEGOTIATION';
  };

  const handleHandOver = async () => {
    if (!chatRoom) return;

    try {
      setConfirming(true);
      const response = await api.post(`/chat/${chatRoom._id}/hand-over`);
      setChatRoom(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error marking as handed over:', err);
      setError(err.response?.data?.message || 'Failed to mark as handed over');
    } finally {
      setConfirming(false);
    }
  };

  const handlePickedUp = async () => {
    if (!chatRoom) return;

    try {
      setConfirming(true);
      const response = await api.post(`/chat/${chatRoom._id}/picked-up`);
      setChatRoom(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error marking as picked up:', err);
      setError(err.response?.data?.message || 'Failed to mark as picked up');
    } finally {
      setConfirming(false);
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

      {/* Status Section */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getConfirmationStatus() === 'CONFIRMED' ? (
              <>
                <Check className="text-green-500" size={20} />
                <span className="font-semibold text-green-600">Confirmed</span>
              </>
            ) : getConfirmationStatus() === 'PARTIALLY_CONFIRMED' ? (
              <>
                <Clock className="text-yellow-500" size={20} />
                <span className="font-semibold text-yellow-600">Partially Confirmed</span>
              </>
            ) : (
              <>
                <Clock className="text-orange-500" size={20} />
                <span className="font-semibold text-orange-600">In Negotiation</span>
              </>
            )}
          </div>
        </div>

        {/* Confirmation Status Details */}
        {getConfirmationStatus() !== 'CONFIRMED' && (
          <div className="text-sm text-gray-600 mb-3 space-y-1">
            <p>✓ Lender confirmed: {chatRoom?.lenderConfirmed ? 'Yes' : 'No'}</p>
            <p>✓ Borrower confirmed: {chatRoom?.borrowerConfirmed ? 'Yes' : 'No'}</p>
          </div>
        )}

        {/* Confirmation Buttons */}
        {getConfirmationStatus() !== 'CONFIRMED' && (
          <div className="flex gap-2">
            {getUserRole() === 'lender' && !chatRoom?.lenderConfirmed && (
              <button
                onClick={() => handleConfirmation('lend')}
                disabled={confirming}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg transition disabled:opacity-50"
              >
                {confirming ? <Loader size={16} className="animate-spin" /> : 'Confirm Lending'}
              </button>
            )}
            {getUserRole() === 'requester' && !chatRoom?.borrowerConfirmed && (
              <button
                onClick={() => handleConfirmation('borrow')}
                disabled={confirming}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg transition disabled:opacity-50"
              >
                {confirming ? <Loader size={16} className="animate-spin" /> : 'Confirm Borrowing'}
              </button>
            )}
          </div>
        )}

        {/* Hand Over / Picked Up Status */}
        {getConfirmationStatus() === 'CONFIRMED' && (
          <div className="flex gap-2">
            {getUserRole() === 'lender' && !chatRoom?.handedOver && (
              <button
                onClick={handleHandOver}
                disabled={confirming}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                title="Mark as handed over"
              >
                {confirming ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <>Hand Over</>
                )}
              </button>
            )}
            {chatRoom?.handedOver && !chatRoom?.pickedUp && getUserRole() === 'requester' && (
              <button
                onClick={handlePickedUp}
                disabled={confirming}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                title="Mark as picked up"
              >
                {confirming ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <>Picked Up</>
                )}
              </button>
            )}
            {chatRoom?.handedOver && chatRoom?.pickedUp && (
              <div className="flex-1 bg-green-100 text-green-700 font-semibold py-2 px-3 rounded-lg text-center">
                ✓ Transaction Complete
              </div>
            )}
          </div>
        )}
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
                {msg.type === 'image' ? (
                  <div className="space-y-2">
                    <img
                      src={msg.content}
                      alt="Message attachment"
                      className="max-w-xs rounded-lg"
                    />
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
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
        {/* Image Preview */}
        {selectedImage && (
          <div className="mb-3 relative w-24 h-24">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg border-2 border-eco-main"
            />
            <button
              type="button"
              onClick={removeSelectedImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Input Controls */}
        <div className="flex gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-eco-main"
          />

          {/* Image Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className="bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach image"
          >
            <ImageIcon size={20} />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={sending || (!messageText.trim() && !selectedImage)}
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
