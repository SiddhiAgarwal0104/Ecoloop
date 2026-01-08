import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Package, Eye, ArrowRight, AlertCircle, Navigation, X, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * My Recycles Page Component
 * Display accepted recycling requests
 */
const MyRecycles = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [recycles, setRecycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecycles();
  }, []);

  const fetchRecycles = async () => {
    try {
      const response = await api.get('/recycle/my');
      console.log('✅ My recycle requests:', response.data);
      setRecycles(response.data.data?.recycleRequests || response.data?.data || []);
      setError(null);
    } catch (error) {
      console.error('❌ Failed to fetch recycles:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load recycles');
      setRecycles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecycles = recycles.filter((r) =>
    filter === 'ALL' ? true : r.status === filter
  );

  const getStatusColor = (status) => {
    if (status === 'AVAILABLE') return 'bg-green-100 text-green-700';
    if (status === 'ACCEPTED') return 'bg-yellow-100 text-yellow-700';
    if (status === 'PICKED_UP') return 'bg-blue-100 text-blue-700';
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
      {filteredRecycles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecycles.map((recycle) => (
            <div key={recycle._id} className="card hover:shadow-2xl transition">
              {recycle.images?.[0] && (
                <img
                  src={recycle.images[0]}
                  alt={recycle.wasteCategory}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
              )}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-eco-dark">{recycle.wasteCategory}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(recycle.status)}`}>
                  {recycle.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Type:</strong> {recycle.wasteType}</p>
                <p><strong>Quantity:</strong> {recycle.quantity} {recycle.unit}</p>
                <p><strong>Location:</strong> {recycle.pickupLocation?.address}</p>
                {recycle.assignedRecycler && (
                  <p><strong>Recycler:</strong> {recycle.assignedRecycler?.name}</p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(recycle.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No recycle requests found</p>
        </div>
      )}
    </div>
  );
};

export default MyRecycles;
