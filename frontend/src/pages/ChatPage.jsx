import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatWindow from '../components/chat/ChatWindow';
import { getChatRoomByRequest } from '../services/chatService';
import Loader from '../components/shared/Loader';
import { toast } from 'react-toastify';


const ChatPage = () => {
  const { requestId } = useParams(); // ✅ requestId from URL
  const navigate = useNavigate();


  const [chatRoom, setChatRoom] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchChatRoom();
  }, [requestId]);


  const fetchChatRoom = async () => {
    try {
      setLoading(true);


      /**
       * This API:
       * - finds existing chat room OR
       * - creates one if not present
       */
      const room = await getChatRoomByRequest(requestId);
      setChatRoom(room);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load chat room');
      navigate('/community/requests');
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <Loader fullScreen />;
  if (!chatRoom) return null;


  return (
    <div className="min-h-screen bg-eco-light p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-eco-main transition-colors mb-4"
        >
          <span style={{fontSize:20,lineHeight:0}}>&larr;</span>
          <span>Back</span>
        </button>
        <div className="card p-0 overflow-hidden">
          <ChatWindow
            chatRoom={chatRoom}
            onBack={() => navigate(-1)}
          />
        </div>
      </div>
    </div>
  );
};


export default ChatPage;
