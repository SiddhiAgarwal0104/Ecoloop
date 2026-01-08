import { useState, useEffect } from 'react';
import { MapPin, Package, Navigation, Check, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

/**
 * Recycler Available Requests Page
 * Browse and accept recycling requests from households
 */
const RecyclerRequests = () => {
  const { api, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [recyclerCity, setRecyclerCity] = useState('');

  // Extract city from recycler profile
  useEffect(() => {
    if (user?.city) {
      setRecyclerCity(user.city);
      console.log(`📍 Recycler city: ${user.city}`);
    } else {
      console.log('📍 No city found in user profile');
    }
  }, [user]);

  useEffect(() => {
    // Fetch requests even if no city (will show all)
    fetchRequests();
  }, [recyclerCity]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { limit: 50 };
      if (recyclerCity) {
        params.city = recyclerCity;
        console.log(`🏙️ Fetching requests for city: ${recyclerCity}`);
      } else {
        console.log('🌍 Fetching all available requests (no city filter)');
      }

      const response = await axios.get('/recycler/requests/available', { params });
      console.log('✅ Available requests loaded:', response.data);
      
      const data = response.data?.data || response.data?.requests || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Failed to fetch requests:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    if (!confirm('Accept this recycling request?')) return;

    try {
      console.log('📤 Accepting request:', requestId);
      await axios.post(`/recycler/requests/${requestId}/accept`);
      
      alert('✅ Request accepted! Check "My Requests" to view it.');
      
      // Remove from available list
      setRequests(requests.filter(r => r._id !== requestId));
    } catch (err) {
      console.error('❌ Failed to accept request:', err);
      alert(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const getDistance = (request) => {
    if (!user?.location?.latitude || !user?.location?.longitude) return null;
    if (!request.pickupLocation?.latitude || !request.pickupLocation?.longitude) return null;
    
    return calculateDistance(
      user.location.latitude,
      user.location.longitude,
      request.pickupLocation.latitude,
      request.pickupLocation.longitude
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-eco-main" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Requests</h1>
          <p className="text-gray-600 mt-1">
            {recyclerCity && `Showing requests from ${recyclerCity}`}
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 bg-eco-main text-white rounded-lg hover:bg-eco-dark transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-eco-main text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Requests ({requests.length})
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-semibold">❌ {error}</p>
          <button 
            onClick={fetchRequests}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.length > 0 ? (
          requests.map((request) => {
            const distance = getDistance(request);
            return (
              <div key={request._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-eco-main to-eco-dark text-white">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{request.wasteCategory}</h3>
                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">
                      New
                    </span>
                  </div>
                  <p className="text-sm opacity-90">{request.wasteType || 'Recyclable'} Waste</p>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Quantity */}
                  <div className="flex items-center gap-3">
                    <Package className="text-eco-main flex-shrink-0" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className="font-semibold text-gray-900">
                        {request.quantity} {request.unit}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="text-eco-main flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Pickup Address</p>
                      <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {request.pickupLocation?.address || 'Address not available'}
                      </p>
                    </div>
                  </div>

                  {/* Distance */}
                  {distance && (
                    <div className="flex items-center gap-3 bg-eco-light/30 p-2 rounded">
                      <Navigation className="text-eco-main flex-shrink-0" size={20} />
                      <div>
                        <p className="text-xs text-gray-600">Distance</p>
                        <p className="font-semibold text-eco-main">
                          {distance} km away
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {request.description && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {request.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t">
                  <button
                    onClick={() => handleAccept(request._id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-eco-main text-white rounded-lg hover:bg-eco-dark transition-colors font-medium"
                  >
                    <Check size={18} />
                    Accept Request
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <Package className="text-gray-300 mx-auto mb-3" size={64} />
            <p className="text-gray-500 text-lg">
              No available requests at the moment
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Check back later for new recycling opportunities
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecyclerRequests;