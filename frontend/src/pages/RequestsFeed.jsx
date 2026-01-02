import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Pin, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';


import RequestCard from '../components/request/RequestCard';
import Loader from '../components/shared/Loader';


import { getLocalityRequests, showInterest, getMyRequests } from '../services/requestService';
import { useAuth } from '../context/AuthContext';


const CATEGORIES = [
  'All',
  'Electronics',
  'Tools',
  'Sports',
];


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

      if (selectedStatus !== 'ALL') {
        filters.status = selectedStatus;
      }

      if (selectedCategory !== 'All') {
        filters.category = selectedCategory;
      }

      const response = await getLocalityRequests(filters);
      setRequests(response || []);

      // Fetch user's active requests for pinning
      if (user) {
        const myRequests = await getMyRequests();
        const communityResponse = await getLocalityRequests({});
        
        // Get user's own active requests
        const userOwnRequests = (myRequests || []).filter(r => 
          ['NEGOTIATING', 'CONFIRMED', 'ACTIVE'].includes(r.status) && r.status !== 'CANCELLED'
        );
        
        // Get requests from other users that are NEGOTIATING (user showed interest)
        const communityNegotiating = (communityResponse || []).filter(r =>
          ['NEGOTIATING', 'CONFIRMED', 'ACTIVE'].includes(r.status) && r.status !== 'CANCELLED'
        );
        
        // Combine both for pinned section
        const combined = [...userOwnRequests, ...communityNegotiating];
        // Remove duplicates by request ID
        const unique = combined.filter((req, idx, arr) => arr.findIndex(r => r._id === req._id) === idx);
        setMyActiveRequests(unique);
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
      console.log('Chat room result:', result);
      
      // Navigate to chat room using the returned data
      const chatRoomId = result._id || result.data?._id;
      if (chatRoomId) {
        navigate(`/community/chat/${chatRoomId}`, {
          state: { chatRoom: result }
        });
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error details:', error);
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
    // Filter by search term
    const matchesSearch = request.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    // Exclude requests that are already pinned
    const notPinned = !myActiveRequests.some(r => r._id === request._id);
    return matchesSearch && notPinned;
  });



  return (
    <div className="min-h-screen bg-eco-light">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-eco-main transition-colors mb-4"
            >
              <span style={{fontSize:20,lineHeight:0}}>&larr;</span>
              <span>Back</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-eco-dark">
                  Community Requests
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Browse requests from your locality and help your neighbors
                </p>
              </div>
              <button
                onClick={() => navigate('/community/create-request')}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={20} />
                Create Request
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="px-6 py-6">
          <div className="card shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>

              {/* Category */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field w-full"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="ALL">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="NEGOTIATING">Negotiating</option>
                  <option value="CONFIRMED">Confirmed</option>
                </select>
              </div>
            </div>

            {/* Secondary Action */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate('/community/active-lendings')}
                className="btn-secondary flex items-center gap-2 px-4 py-2 border border-eco-main text-eco-main rounded-lg hover:bg-eco-main hover:text-white transition-colors font-semibold text-sm"
              >
                View Active Lendings
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6">


        {/* Requests Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="xl" />
          </div>
        ) : (
          <>
            {/* Pinned Section - User's Active & Negotiating Requests */}
            {myActiveRequests.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <Pin className="text-orange-600 fill-orange-600" size={26} />
                    <h2 className="text-2xl font-bold text-gray-800">Your Active Negotiations & Confirmations</h2>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {myActiveRequests.map((request) => (
                    <div 
                      key={request._id} 
                      className="bg-white rounded-xl border-2 border-orange-400 shadow-md hover:shadow-lg transition-shadow overflow-hidden relative"
                    >
                      {/* Pin Badge */}
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                        <Pin size={14} className="fill-white" />
                        <span className="text-xs font-bold">PINNED</span>
                      </div>
                      
                      {/* Content */}
                      <div className="p-5">
                        <div className="mb-3">
                          <h3 className="font-bold text-lg text-gray-800 pr-24">{request.itemName}</h3>
                          <p className="text-sm text-gray-600 mt-1">{request.category}</p>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-4">
                          <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${
                            request.status === 'NEGOTIATING' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {request.status === 'NEGOTIATING' ? '🤝 In Negotiation' :
                             request.status === 'CONFIRMED' ? '✓ Confirmed' : '⚡ Active'}
                          </span>
                        </div>

                        {/* Description */}
                        {request.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{request.description}</p>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-2">
                          {['NEGOTIATING', 'CONFIRMED'].includes(request.status) && (
                            <button
                              onClick={() => navigate(`/community/chat/${request._id}`)}
                              className="flex-1 bg-eco-main hover:bg-eco-dark text-white font-semibold py-2.5 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1.5"
                            >
                              <MessageSquare size={16} />
                              Continue Chat
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/community/my-requests`, { state: { selectedRequestId: request._id, request } })}
                            className={`flex-1 border-2 border-eco-main text-eco-main hover:bg-eco-main hover:text-white font-semibold py-2.5 px-3 rounded-lg transition-colors text-sm`}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Separator */}
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
                  <p className="text-gray-400 text-sm mt-2">
                    Try adjusting filters or create a request to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRequests.map((request) => (
                    <RequestCard
                      key={request._id}
                      request={request}
                      onInterested={handleInterested}
                    />
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
