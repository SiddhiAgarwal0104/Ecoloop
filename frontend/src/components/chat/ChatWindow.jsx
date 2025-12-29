import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Image as ImageIcon } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConfirmationButtons from './ConfirmationButtons';
import { getChatMessages, sendMessage, sendImageMessage } from '../../services/chatService';
import socketService from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';
import Loader from '../shared/Loader';

const ChatWindow = ({ chatRoom, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const otherUser = chatRoom.participants.find(
    (p) => p.userId._id !== user.id
  );

  useEffect(() => {
    fetchMessages();
    socketService.joinChatRoom(chatRoom._id);

    // Listen for new messages
    socketService.on('newMessage', handleNewMessage);

    // Listen for lending confirmed
    socketService.on('lendingConfirmed', handleLendingConfirmed);

    return () => {
      socketService.leaveChatRoom(chatRoom._id);
      socketService.off('newMessage', handleNewMessage);
      socketService.off('lendingConfirmed', handleLendingConfirmed);
    };
  }, [chatRoom._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await getChatMessages(chatRoom._id);
      setMessages(response);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
  // 🚫 Ignore own message (already added optimistically)
  const handleNewMessage = (message) => {
  setMessages((prev) => {
    if (prev.some((m) => m._id === message._id)) return prev;
    return [...prev, message];
  });
};


  setMessages((prev) => [...prev, message]);
};


  const handleLendingConfirmed = (data) => {
    // Refresh chat room data or show notification
    console.log('Lending confirmed:', data);
  };

  const handleSendMessage = async (content) => {
  if (!content.trim() || sending) return;

  const tempMessage = {
    _id: `temp-${Date.now()}`,
    senderId: {
      _id: user.id,
      name: user.name,
    },
    content,
    type: 'text',
    createdAt: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, tempMessage]);
  setSending(true);

  try {
    await sendMessage(chatRoom._id, content);
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    setSending(false);
  }
};



const handleSendImage = async (file) => {
  if (sending) return;

  const tempMessage = {
    _id: `temp-${Date.now()}`,
    senderId: {
      _id: user.id,
      name: user.name,
    },
    content: URL.createObjectURL(file),
    type: 'image',
    createdAt: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, tempMessage]);
  setSending(true);

  try {
    await sendImageMessage(chatRoom._id, file);
  } catch (error) {
    console.error('Error sending image:', error);
  } finally {
    setSending(false);
  }
};



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-eco-dark">
              {chatRoom.requestId.itemName}
            </h3>
            <p className="text-sm text-gray-600">
              Chat with {otherUser?.userId.name}
            </p>
          </div>

          <span className="badge badge-info">
            {chatRoom.requestId.status}
          </span>
        </div>
      </div>

      {/* Confirmation Status */}
      {chatRoom.requestId.status === 'NEGOTIATING' && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Waiting for mutual confirmation
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                {chatRoom.lenderConfirmed && 'Lender confirmed ✓ '}
                {chatRoom.borrowerConfirmed && 'Borrower confirmed ✓'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            <MessageList messages={messages} currentUserId={user.id} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Confirmation Buttons */}
      {chatRoom.requestId.status === 'NEGOTIATING' && (
        <ConfirmationButtons chatRoom={chatRoom} />
      )}

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendImage={handleSendImage}
        disabled={sending || chatRoom.requestId.status === 'COMPLETED'}
      />
    </div>
  );
};

export default ChatWindow;