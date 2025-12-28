import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatWindow from '../components/chat/ChatWindow';
import { getChatRoomByRequest } from '../services/chatService';
import Loader from '../components/shared/Loader';
import { toast } from 'react-toastify';

const ChatPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [chatRoom, setChatRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatRoom();
  }, [requestId]);

  const fetchChatRoom = async () => {
    try {
      setLoading(true);
      const response = await getChatRoomByRequest(requestId);
      setChatRoom(response);
    } catch (error) {
      toast.error('Failed to load chat room');
      console.error('Error fetching chat room:', error);
      navigate('/community/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/community/requests');
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!chatRoom) {
    return (
      <div className="min-h-screen bg-eco-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Chat room not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eco-light p-6">
      <div className="max-w-5xl mx-auto">
        <div className="card p-0 overflow-hidden">
          <ChatWindow chatRoom={chatRoom} onBack={handleBack} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;