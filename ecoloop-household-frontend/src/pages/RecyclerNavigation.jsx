import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User, Calendar, Package } from 'lucide-react';
import MapNavigation from '../components/MapNavigation';
import axios from '../api/axios';
import { useAuth } from '../hooks';

/**
 * Recycler Navigation Page
 * Shows map route to user's pickup location
 */
const RecyclerNavigation = () => {
  const { recycleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recyclerLocation, setRecyclerLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  console.log(`📍 RecyclerNavigation mounted`);
  console.log(`   - recycleId from URL: ${recycleId}`);
  console.log(`   - user: ${user?.name || 'Not authenticated'}`);

  useEffect(() => {
    if (user && recycleId) {
      fetchRequestDetails();
      getCurrentLocation();
    }
  }, [user, recycleId]);

  const fetchRequestDetails = async () => {
    try {
      const token = localStorage.getItem('recycler_token');
      console.log(`📡 Fetching recycle details for ID: ${recycleId}`);
      console.log(`🔑 Token exists: ${token ? '✅' : '❌'}`);
      
      const response = await axios.get(`/integration/recycle/${recycleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`✅ Recycle details fetched:`, response.data?.data);
      setRequest(response.data?.data);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching request:');
      console.error(`   Status: ${err.response?.status}`);
      console.error(`   Message: ${err.response?.data?.message || err.message}`);
      console.error(`   Full error:`, err);
      setError(err.response?.data?.message || 'Failed to load request details');
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setRecyclerLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.warn('Geolocation error:', error)
      );
    }
  };

  const handleRouteSelected = (routeData) => {
    setRouteInfo({
      distance: (routeData.distance / 1000).toFixed(2),
      time: Math.round(routeData.time / 60)
    });
  };

  const handleMarkAsPickedUp = async () => {
    try {
      const token = localStorage.getItem('recycler_token');
      await axios.patch(
        `/integration/recycle/${recycleId}/status`,
        { status: 'PICKED_UP' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Marked as picked up!');
      navigate('/my-requests');
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-[#c8e6c9] border-t-eco-main rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/my-requests')}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to My Requests
        </button>
        <div className="message message-error">
          <p>{error || 'Request not found'}</p>
          <p className="text-sm mt-2">Recycle ID: {recycleId}</p>
          {error && (
            <details className="mt-2 text-xs">
              <summary>Debug Info</summary>
              <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-48">
                {JSON.stringify({ error, recycleId }, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/my-requests')}
          className="btn btn-secondary p-2"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Navigation to Pickup Location</h1>
          <p className="text-gray-600 mt-1">{request.wasteCategory} - {request.wasteType}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="card">
            {recyclerLocation && request.pickupLocation ? (
              <MapNavigation
                startLocation={recyclerLocation}
                endLocation={{
                  lat: request.pickupLocation.latitude,
                  lng: request.pickupLocation.longitude
                }}
                onRouteSelected={handleRouteSelected}
                height="h-96"
              />
            ) : (
              <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-600">
                  {recyclerLocation ? 'Loading location data...' : 'Waiting for your location...'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-4">
          {/* Route Info */}
          {routeInfo && (
            <div className="card bg-eco-light border-2 border-eco-main">
              <h3 className="font-bold text-eco-dark mb-3 flex items-center gap-2">
                <MapPin size={20} className="text-eco-main" />
                Route Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-bold text-eco-dark">{routeInfo.distance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Time:</span>
                  <span className="font-bold text-eco-dark">{routeInfo.time} min</span>
                </div>
              </div>
            </div>
          )}

          {/* Request Details */}
          <div className="card">
            <h3 className="font-bold text-eco-dark mb-4">Request Details</h3>
            <div className="space-y-4">
              {/* Category */}
              <div className="flex items-start gap-3">
                <Package className="text-eco-main mt-1" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Waste Type</p>
                  <p className="font-semibold text-gray-900">{request.wasteCategory}</p>
                  <p className="text-sm text-gray-600">{request.wasteType}</p>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-start gap-3 py-3 border-t border-[#c8e6c9]">
                <Package className="text-eco-main mt-1" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Quantity</p>
                  <p className="font-semibold text-gray-900">
                    {request.quantity} {request.unit}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 py-3 border-t border-[#c8e6c9]">
                <MapPin className="text-eco-main mt-1" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Pickup Address</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {request.pickupLocation?.address || 'No address available'}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-3 py-3 border-t border-[#c8e6c9]">
                <Calendar className="text-eco-main mt-1" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Preferred Date</p>
                  <p className="font-semibold text-gray-900">
                    {request.preferredPickupDate
                      ? new Date(request.preferredPickupDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="card border-2 border-yellow-200 bg-yellow-50">
            <h3 className="font-bold text-eco-dark mb-4 flex items-center gap-2">
              <User size={18} className="text-yellow-600" />
              Donor Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">{request.userName || 'N/A'}</p>
              </div>
              {request.userPhone && (
                <div className="flex items-center gap-2 pt-3 border-t border-yellow-200">
                  <Phone className="text-yellow-600" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <a
                      href={`tel:${request.userPhone}`}
                      className="font-semibold text-yellow-600 hover:text-yellow-700"
                    >
                      {request.userPhone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleMarkAsPickedUp}
              className="btn btn-success w-full justify-center"
            >
              <MapPin size={18} />
              Mark as Picked Up
            </button>
            <button
              onClick={() => navigate('/my-requests')}
              className="btn btn-secondary w-full justify-center"
            >
              Back to My Requests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecyclerNavigation;
