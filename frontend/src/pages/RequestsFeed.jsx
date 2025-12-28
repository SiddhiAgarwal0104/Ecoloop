import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus } from 'lucide-react';
import RequestCard from '../components/request/RequestCard';
import Loader from '../components/shared/Loader';
import { getLocalityRequests, showInterest } from '../services/requestService';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All',
  'Electronics',
  'Tools',
  'Sports',
  'Books',
  'Furniture',
  'Vehicles',
  'Clothing',
  'Kitchen',
  'Garden',
  'Other',
];

const RequestsFeed = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('OPEN');

  useEffect(() => {
    if (!authLoading) {
      fetchRequests();
    }
  }, [selectedCategory, selectedStatus, authLoading]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const filters = {
        status: selectedStatus,
      };
      if (selectedCategory !== 'All') {
        filters.category = selectedCategory;
      }
      
      const response = await getLocalityRequests(filters);
      setRequests(response || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
      // Don't show error toast if not authenticated
      if (user) {
        toast.error('Failed to fetch requests');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInterested = async (requestId) => {
    try {
      const response = await showInterest(requestId);
      toast.success('Chat room created! You can now discuss with the requester.');
      navigate(`/community/chat/${requestId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to show interest');
      console.error('Error showing interest:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-eco-light flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const filteredRequests = requests.filter((request) =>
    request.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-eco-light p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-eco-dark mb-2">
              Community Requests
            </h1>
            <p className="text-gray-600">
              Browse requests from your locality and help your neighbors
            </p>
          </div>
          <button
            onClick={() => navigate('/community/create-request')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Create Request</span>
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="OPEN">Open</option>
              <option value="NEGOTIATING">Negotiating</option>
              <option value="CONFIRMED">Confirmed</option>
            </select>
          </div>
        </div>

        {/* Requests Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="xl" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No requests found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your filters or create a new request
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
    </div>
  );
};

export default RequestsFeed;