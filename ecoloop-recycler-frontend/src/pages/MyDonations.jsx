import React, { useState, useEffect } from 'react';
import { MapPin, Package, Navigation, Check } from 'lucide-react';
import axios from '../api/axios';
import { useRecyclerLocation, useAuth } from '../hooks';
import { formatNumber, calculateDistance } from '../utils/helpers';

/**
 * Available Requests Page Component
 * Browse and accept new recycling requests
 * Automatically filters by recycler's profile city
 */
const AvailableRequests = () => {
  const { latitude, longitude, getLocation } = useRecyclerLocation();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, nearby
  const [nearbyDistance, setNearbyDistance] = useState(5);
  const [recyclerCity, setRecyclerCity] = useState('');
  const [page, setPage] = useState(1);

  // Extract city from recycler's address
  useEffect(() => {
    if (user?.address) {
      // Extract first meaningful part before comma as city
      const addressParts = user.address.split(',');
      if (addressParts.length > 0) {
        const city = addressParts[0].trim();
        setRecyclerCity(city);
        console.log(`📍 Recycler city extracted from profile: ${city}`);
      }
    }
  }, [user]);

  useEffect(() => {
    // Get user location
    getLocation();
    // Fetch available requests
    if (recyclerCity) {
      fetchRequests();
    }
  }, [recyclerCity]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      // Call recycler backend API for available recycles (filtered by recycler's city)
      const params = { page, limit: 20 };
      if (recyclerCity) {
        params.city = recyclerCity;
        console.log(`🏙️ Fetching requests for city: ${recyclerCity}`);
      }
      const response = await axios.get('/integration/recycle/available', {
        params
      });
      console.log('✅ Available requests:', response.data?.data);
      setRequests(response.data?.data || []);
    } catch (err) {
      console.error('❌ Failed to fetch requests:', err);
      setError(err.response?.data?.error || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter and sort requests
   */
  const filteredRequests = requests.filter(req => {
    if (filter === 'nearby' && latitude && longitude) {
      const distance = calculateDistance(
        latitude,
        longitude,
        req.pickupLocation?.latitude || 0,
        req.pickupLocation?.longitude || 0
      );
      return distance <= nearbyDistance;
    }
    return true;
  });

  /**
   * Sort by distance if showing nearby
   */
  const sortedRequests = filter === 'nearby' && latitude && longitude
    ? filteredRequests.sort((a, b) => {
        const distA = calculateDistance(
          latitude,
          longitude,
          a.pickupLocation?.latitude || 0,
          a.pickupLocation?.longitude || 0
        );
        const distB = calculateDistance(
          latitude,
          longitude,
          b.pickupLocation?.latitude || 0,
          b.pickupLocation?.longitude || 0
        );
        return distA - distB;
      })
    : filteredRequests;

  /**
   * Get distance to request
   */
  const getDistance = (req) => {
    if (!latitude || !longitude) return null;
    return calculateDistance(
      latitude,
      longitude,
      req.pickupLocation?.latitude || 0,
      req.pickupLocation?.longitude || 0
    );
  };

  /**
   * Handle accept request
   */
  const handleAccept = async (requestId) => {
    try {
      console.log('📤 Accepting recycle request:', requestId);
      // Call API to accept recycle request on recycler backend
      const response = await axios.post(`/integration/recycle/${requestId}/accept`);
      console.log('✅ Recycle request accepted:', response.data);
      
      // Remove the accepted request from the list
      setRequests(requests.filter(r => r._id !== requestId));
      
      // Show success message
      alert('✅ Recycle request accepted! Check "My Requests" to view it.');
    } catch (err) {
      console.error('❌ Failed to accept recycle request:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to accept recycle request';
      alert(`❌ ${errorMsg}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-eco-light border-t-eco-main rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Available Requests</h1>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 bg-eco-main text-white rounded-lg hover:bg-eco-dark transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-eco-main text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Requests ({requests.length})
            {recyclerCity && <span className="text-xs ml-2">({recyclerCity})</span>}
          </button>
          <button
            onClick={() => setFilter('nearby')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'nearby'
                ? 'bg-eco-main text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Nearby Requests ({filteredRequests.length})
          </button>
        </div>

        {/* Nearby Filter Controls */}
        {filter === 'nearby' && (
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Distance Radius:</label>
            <input
              type="range"
              min="1"
              max="50"
              value={nearbyDistance}
              onChange={(e) => setNearbyDistance(parseInt(e.target.value))}
              className="flex-1 max-w-xs"
            />
            <span className="text-sm font-semibold text-eco-main">{nearbyDistance} km</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
        {sortedRequests.length > 0 ? (
          sortedRequests.map((request) => {
            const distance = getDistance(request);
            return (
              <div key={request._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-eco-main to-eco-dark text-white">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-lg">{request.wasteCategory}</h3>
                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">
                      New
                    </span>
                  </div>
                  <p className="text-sm opacity-90">{request.wasteType} Waste</p>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Quantity */}
                  <div className="flex items-center gap-3">
                    <Package className="text-eco-main" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className="font-semibold text-gray-900">
                        {formatNumber(request.quantity)} {request.unit}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-3">
                    <MapPin className="text-eco-main" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Pickup Address</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {request.pickupLocation?.address || 'Address not available'}
                      </p>
                    </div>
                  </div>

                  {/* Distance */}
                  {distance && (
                    <div className="flex items-center gap-3 bg-eco-light/30 p-2 rounded">
                      <Navigation className="text-eco-main" size={20} />
                      <div>
                        <p className="text-xs text-gray-600">Distance</p>
                        <p className="font-semibold text-eco-main">
                          {formatNumber(distance)} km away
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
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
            <Package className="text-gray-300 mx-auto mb-3" size={48} />
            <p className="text-gray-500">
              {filter === 'nearby'
                ? `No requests within ${nearbyDistance} km`
                : 'No available requests at the moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableRequests;
