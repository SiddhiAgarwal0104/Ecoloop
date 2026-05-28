import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pin, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

import RequestCard from '../components/request/RequestCard';
import Loader from '../components/shared/Loader';
import api from '../services/api';

import { getLocalityRequests, showInterest, getMyRequests } from '../services/requestService';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Electronics', 'Tools', 'Sports'];

const RequestsFeed = () => {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [myActiveRequests, setMyActiveRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, [selectedCategory, selectedStatus, authLoading]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const filters = {};
      if (selectedStatus !== 'ALL') filters.status = selectedStatus;
      if (selectedCategory !== 'All') filters.category = selectedCategory;

      const response = await getLocalityRequests(filters);
      setRequests(response || []);

      if (user) {
        const myRequests = await getMyRequests();

        // Only pin NEGOTIATING requests (not CONFIRMED — those go to Active Lendings)
        const negotiatingRequests = (myRequests || []).filter(r => r.status === 'NEGOTIATING');

        // Fetch actual chat room ID for each
        const withChatRoom = await Promise.all(
          negotiatingRequests.map(async (r) => {
            try {
              const res = await api.get(`/chat/room/${r._id}`);
              return { ...r, chatRoomId: res.data.data?._id };
            } catch {
              return { ...r, chatRoomId: null };
            }
          })
        );

        setMyActiveRequests(withChatRoom);
      }
    } catch (error) {
      console.error(error);
      setRequests([]);
      if (user) toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleInterested = async (requestId) => {
    try {
      const result = await showInterest(requestId);
      toast.success('Chat room created! You can now discuss.');
      const chatRoomId = result._id || result.data?._id;
      if (chatRoomId) {
        navigate(`/community/chat/${chatRoomId}`, { state: { chatRoom: result } });
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to show interest';
      toast.error(errorMsg);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-eco-light flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const notPinned = !myActiveRequests.some(r => r._id === request._id);
    return matchesSearch && notPinned;
  });

  return (
    <div className="min-h-screen bg-eco-light">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="px-6 py-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-eco-main transition-colors mb-4">
              <span style={{ fontSize: 20, lineHeight: 0 }}>&larr;</span>
              <span>Back</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-eco-dark">Community Requests</h1>
                <p className="text-gray-600 text-sm mt-1">Browse requests from your locality and help your neighbors</p>
              </div>
              <button onClick={() => navigate('/community/create-request')} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                <Plus size={20} />
                Create Request
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-6">
          <div className="card shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-field w-full">
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="input-field w-full">
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="NEGOTIATING">Negotiating</option>
                <option value="CONFIRMED">Confirmed</option>
              </select>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
              <button onClick={() => navigate('/community/my-requests')} className="btn-secondary flex items-center gap-2 px-4 py-2 border border-eco-main text-eco-main rounded-lg hover:bg-eco-main hover:text-white transition-colors font-semibold text-sm">
                My Requests
              </button>
              <button onClick={() => navigate('/community/active-lendings')} className="btn-secondary flex items-center gap-2 px-4 py-2 border border-eco-main text-eco-main rounded-lg hover:bg-eco-main hover:text-white transition-colors font-semibold text-sm">
                View Active Lendings
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader size="xl" /></div>
          ) : (
            <>
              {/* Pinned — NEGOTIATING only */}
              {myActiveRequests.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-5">
                    <Pin className="text-orange-600 fill-orange-600" size={26} />
                    <h2 className="text-2xl font-bold text-gray-800">Your Active Negotiations</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {myActiveRequests.map((request) => (
                      <div key={request._id} className="bg-white rounded-xl border-2 border-orange-400 shadow-md hover:shadow-lg transition-shadow overflow-hidden relative">
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                          <Pin size={14} className="fill-white" />
                          <span className="text-xs font-bold">PINNED</span>
                        </div>
                        <div className="p-5">
                          <div className="mb-3">
                            <h3 className="font-bold text-lg text-gray-800 pr-24">{request.itemName}</h3>
                            <p className="text-sm text-gray-600 mt-1">{request.category}</p>
                          </div>
                          <div className="mb-4">
                            <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-800">
                              🤝 In Negotiation
                            </span>
                          </div>
                          {request.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{request.description}</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/community/chat/${request.chatRoomId || request._id}`)}
                              className="flex-1 bg-eco-main hover:bg-eco-dark text-white font-semibold py-2.5 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1.5"
                            >
                              <MessageSquare size={16} />
                              Continue Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 pt-6 border-t-2 border-gray-200"></div>
                </div>
              )}

              {/* Community Requests */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <h3 className="text-2xl font-bold text-gray-800">Available Requests in Your Area</h3>
                  <span className="text-lg text-gray-500">({filteredRequests.length})</span>
                </div>
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <div className="text-5xl mb-3">🔍</div>
                    <p className="text-gray-600 text-lg font-semibold">No requests found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting filters or create a request to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map((request) => (
                      <RequestCard key={request._id} request={request} onInterested={handleInterested} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsFeed;
