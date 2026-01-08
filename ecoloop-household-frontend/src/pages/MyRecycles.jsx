import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Package, Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecyclerRatingModal from '../components/RecyclerRatingModal';

/**
 * My Recycles Page Component
 * Display accepted recycling requests with rating functionality
 */
const MyRecycles = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [recycles, setRecycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState(null);
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    recycle: null,
    recyclerInfo: null,
    ratingType: null
  });

  useEffect(() => {
    fetchRecycles();
  }, []);

  const fetchRecycles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/recycle/my');
      console.log('✅ My recycle requests:', response.data);
      const data = response.data.data?.recycleRequests || response.data?.data || [];
      setRecycles(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('❌ Failed to fetch recycles:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load recycles';
      setError(errorMsg);
      setRecycles([]);
    } finally {
      setLoading(false);
    }
  };

  const openRatingModal = (recycle, ratingType) => {
    if (!recycle.assignedRecycler) {
      alert('Recycler information not available');
      return;
    }

    setRatingModal({
      isOpen: true,
      recycle,
      recyclerInfo: recycle.assignedRecycler,
      ratingType
    });
  };

  const closeRatingModal = () => {
    setRatingModal({
      isOpen: false,
      recycle: null,
      recyclerInfo: null,
      ratingType: null
    });
  };

  const handleRatingSuccess = () => {
    alert('Rating submitted successfully!');
    closeRatingModal();
    // Delay fetch to ensure backend is updated
    setTimeout(() => {
      fetchRecycles();
    }, 500);
  };

  const filteredRecycles = recycles.filter((r) =>
    filter === 'ALL' ? true : r.status === filter
  );

  const getStatusColor = (status) => {
    if (status === 'AVAILABLE') return 'bg-green-100 text-green-700';
    if (status === 'ACCEPTED') return 'bg-yellow-100 text-yellow-700';
    if (status === 'PICKED_UP') return 'bg-blue-100 text-blue-700';
    if (status === 'RECYCLED') return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border border-red-200 p-6">
        <p className="text-red-600 font-semibold">Error: {error}</p>
        <button onClick={fetchRecycles} className="btn btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-eco-dark mb-2">My Recycle Requests</h1>
          <p className="text-gray-600">Track all your recycling contributions</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card bg-red-50 border border-red-200 p-6 mb-6">
          <p className="text-red-600 font-semibold">❌ Error: {error}</p>
          <button 
            onClick={fetchRecycles} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          {['ALL', 'AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'RECYCLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                filter === status
                  ? 'bg-eco-main text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Recycles Grid */}
      {!error && filteredRecycles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecycles.map((recycle) => (
            <div key={recycle._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              {/* Image */}
              {recycle.images?.[0] && (
                <img
                  src={recycle.images[0]}
                  alt={recycle.wasteCategory}
                  className="w-full h-48 object-cover"
                />
              )}
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800">{recycle.wasteCategory}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(recycle.status)}`}>
                    {recycle.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p><strong>Type:</strong> {recycle.wasteType}</p>
                  <p><strong>Quantity:</strong> {recycle.quantity} {recycle.unit}</p>
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{recycle.pickupLocation?.address}</span>
                  </p>
                  {recycle.assignedRecycler && (
                    <p><strong>Recycler:</strong> {recycle.assignedRecycler?.name}</p>
                  )}
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(recycle.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Rating Buttons */}
                {recycle.status === 'RECYCLED' && recycle.assignedRecycler && (
                  <button
                    onClick={() => openRatingModal(recycle, 'PICKUP_COMPLETED')}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Star size={16} />
                    Rate Recycler
                  </button>
                )}

                {(recycle.status === 'ACCEPTED' || recycle.status === 'PICKED_UP') && recycle.assignedRecycler && (
                  <button
                    onClick={() => openRatingModal(recycle, 'REQUEST_CANCELLED')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Star size={16} />
                    Report Issue
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            {filter === 'ALL'
              ? 'No recycle requests found'
              : `No ${filter.toLowerCase()} requests`}
          </p>
        </div>
      )}

      {/* Recycler Rating Modal */}
      {ratingModal.isOpen && ratingModal.recycle && ratingModal.recyclerInfo && (
        <RecyclerRatingModal
          recycle={ratingModal.recycle}
          recyclerInfo={ratingModal.recyclerInfo}
          ratingType={ratingModal.ratingType}
          onClose={closeRatingModal}
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
};

export default MyRecycles;
