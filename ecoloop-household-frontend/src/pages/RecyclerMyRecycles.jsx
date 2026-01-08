import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Package, Eye, ArrowRight, AlertCircle, Navigation, X, Copy, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

/**
 * Recycler My Recycles Page Component
 * Display recycler's accepted recycling requests
 */
const RecyclerMyRecycles = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [markingComplete, setMarkingComplete] = useState(null);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch recycler's dashboard which includes all accepted requests
      console.log('📡 Fetching recycler dashboard data...');
      
      const response = await axios.get('/recycler/dashboard');
      console.log('✅ Full dashboard response:', response.data);
      
      const dashboardData = response.data?.data || response.data;
      console.log('✅ Dashboard data object:', dashboardData);
      console.log('✅ Dashboard stats:', dashboardData?.stats);
      console.log('✅ Dashboard requests counts:', dashboardData?.requests);
      console.log('✅ recentRequestsCount from backend:', dashboardData?.recentRequestsCount);
      
      // Get recent requests from dashboard - these are the accepted/picked up/recycled requests
      const allRequests = dashboardData?.recentRequests || [];
      console.log(`✅ Recent requests array length: ${allRequests.length}`);
      console.log('✅ Recent requests array:', allRequests);
      console.log('✅ Recent requests details:', 
        allRequests.map(r => ({
          id: r._id,
          status: r.status,
          wasteCategory: r.wasteCategory,
          quantity: r.quantity,
          unit: r.unit,
          assignedRecycler: r.assignedRecycler,
          createdAt: r.createdAt
        }))
      );
      
      setRequests(allRequests);
    } catch (err) {
      console.error('❌ Failed to fetch requests:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load requests';
      setError(errorMsg);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark request as complete (recycled)
   */
  const handleMarkAsComplete = async (requestId) => {
    setMarkingComplete(requestId);
    try {
      console.log(`📤 Marking request ${requestId} as complete...`);
      const response = await axios.put(`/recycler/requests/${requestId}/complete`, {});
      console.log('✅ Request marked as complete:', response.data);
      
      // Update local state
      setRequests(requests.map(r => 
        r._id === requestId ? { ...r, status: 'RECYCLED' } : r
      ));
      
      // Close modal if it's the selected request
      if (selectedRequest?._id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: 'RECYCLED' });
      }
      
      alert('✅ Request marked as recycled successfully!');
    } catch (err) {
      console.error('❌ Failed to mark request as complete:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update request status';
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setMarkingComplete(null);
    }
  };

  /**
   * Get filtered requests
   */
  const filteredRequests = requests.filter(req => {
    if (filter === 'accepted') return req.status === 'ACCEPTED';
    if (filter === 'picked_up') return req.status === 'PICKED_UP';
    if (filter === 'recycled') return req.status === 'RECYCLED';
    return true;
  });

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    const colors = {
      ACCEPTED: 'bg-yellow-100 text-yellow-700',
      PICKED_UP: 'bg-blue-100 text-blue-700',
      RECYCLED: 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-[#c8e6c9] border-t-eco-main rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">My Accepted Requests</h1>
          <p className="text-gray-600 mt-1">Track your accepted waste pickup requests</p>
        </div>
        <button
          onClick={fetchMyRequests}
          className="btn btn-primary"
        >
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#c8e6c9] overflow-x-auto bg-white px-6 py-4 rounded-t-2xl">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'border-eco-main text-eco-main'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({requests.length})
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap transition-colors ${
            filter === 'accepted'
              ? 'border-eco-main text-eco-main'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Accepted ({requests.filter(r => r.status === 'ACCEPTED').length})
        </button>
        <button
          onClick={() => setFilter('picked_up')}
          className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap transition-colors ${
            filter === 'picked_up'
              ? 'border-eco-main text-eco-main'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Picked Up ({requests.filter(r => r.status === 'PICKED_UP').length})
        </button>
        <button
          onClick={() => setFilter('recycled')}
          className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap transition-colors ${
            filter === 'recycled'
              ? 'border-eco-main text-eco-main'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Recycled ({requests.filter(r => r.status === 'RECYCLED').length})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="message message-error">
          <AlertCircle size={20} />
          <div>
            <p className="font-semibold">Error loading requests</p>
            <p className="text-sm mt-1">{error}</p>
            {error.includes('token') && (
              <p className="text-sm mt-2">
                💡 Tip: Please logout and login again to refresh your session.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Requests Grid */}
      <div className="grid-responsive-3 gap-6">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div key={request._id} className="card">
              {/* Header */}
              <div className="flex justify-between items-start gap-2 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-eco-dark">{request.wasteCategory}</h3>
                  <p className="text-sm text-gray-600">{request.wasteType}</p>
                </div>
                <span className={`badge ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>

              {/* Content */}
              <div className="space-y-3 py-4 border-y border-[#c8e6c9]">
                {/* Quantity */}
                <div className="flex items-center gap-3">
                  <Package className="text-eco-main" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="font-semibold text-gray-900">
                      {request.quantity} {request.unit}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3">
                  <MapPin className="text-eco-main" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">
                      {request.pickupLocation?.address || 'No address'}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="text-eco-main" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Accepted On</p>
                    <p className="font-semibold text-gray-900">
                      {(() => {
                        const dateStr = request.acceptedAt || request.updatedAt;
                        if (!dateStr) return 'N/A';
                        try {
                          const date = new Date(dateStr);
                          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                        } catch {
                          return 'N/A';
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 space-y-2">
                {request.status === 'PICKED_UP' ? (
                  <>
                    <button 
                      onClick={() => handleMarkAsComplete(request._id)}
                      disabled={markingComplete === request._id}
                      className="btn btn-success w-full justify-center disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      <span>{markingComplete === request._id ? 'Marking...' : 'Mark as Complete'}</span>
                    </button>
                    <button 
                      onClick={() => setSelectedRequest(request)}
                      className="btn btn-secondary w-full justify-center"
                    >
                      <Eye size={18} />
                      <span>View Details</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        console.log(`🗺️ Navigating to /recycler/navigate/${request._id}`);
                        navigate(`/recycler/navigate/${request._id}`);
                      }}
                      className="btn btn-success w-full justify-center"
                    >
                      <Navigation size={18} />
                      <span>Navigate</span>
                      <ArrowRight size={18} />
                    </button>
                    <button 
                      onClick={() => setSelectedRequest(request)}
                      className="btn btn-secondary w-full justify-center"
                    >
                      <Eye size={18} />
                      <span>View Details</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full empty-state">
            <Package className="empty-state-icon" size={48} />
            <p className="empty-state-text">No requests found</p>
            <p className="text-gray-400 text-sm mt-2">
              {filter === 'all' 
                ? 'You haven\'t accepted any waste pickup requests yet.'
                : `No ${filter.replace('_', ' ')} requests found.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-eco-light border-b border-[#c8e6c9] p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-eco-dark">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Waste Category</p>
                  <p className="text-lg font-bold text-eco-dark">{selectedRequest.wasteCategory}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <p className={`text-lg font-bold ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </p>
                </div>
              </div>

              {/* Waste Type & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Waste Type</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedRequest.wasteType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Quantity</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedRequest.quantity} {selectedRequest.unit}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Pickup Location</p>
                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <MapPin className="text-eco-main flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900">{selectedRequest.pickupLocation?.address}</p>
                    {selectedRequest.pickupLocation?.latitude && selectedRequest.pickupLocation?.longitude && (
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {selectedRequest.pickupLocation.latitude.toFixed(4)}, {selectedRequest.pickupLocation.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Created</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedRequest.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Accepted</p>
                  <p className="font-semibold text-gray-900">
                    {selectedRequest.acceptedAt 
                      ? new Date(selectedRequest.acceptedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedRequest.description && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">Description</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {selectedRequest.description}
                  </p>
                </div>
              )}

              {/* Request ID */}
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Request ID</p>
                <div className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-mono text-sm text-gray-900 flex-1">{selectedRequest._id}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedRequest._id);
                      alert('Request ID copied!');
                    }}
                    className="text-eco-main hover:text-eco-dark p-2"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              {/* Images */}
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-3">Images</p>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedRequest.images.map((img, idx) => (
                      <img 
                        key={idx}
                        src={img} 
                        alt={`Request ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                {selectedRequest.status === 'PICKED_UP' ? (
                  <>
                    <button
                      onClick={() => {
                        setSelectedRequest(null);
                        handleMarkAsComplete(selectedRequest._id);
                      }}
                      disabled={markingComplete === selectedRequest._id}
                      className="btn btn-success justify-center disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      {markingComplete === selectedRequest._id ? 'Marking...' : 'Mark Complete'}
                    </button>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="btn btn-secondary justify-center"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setSelectedRequest(null);
                        navigate(`/navigate/${selectedRequest._id}`);
                      }}
                      className="btn btn-success justify-center"
                    >
                      <Navigation size={18} />
                      Navigate
                    </button>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="btn btn-secondary justify-center"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecyclerMyRecycles;
