import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Package, MapPin, Phone, User, Navigation, CheckCircle } from 'lucide-react';

const NGOAcceptedDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchAcceptedDonations();
  }, []);

  const fetchAcceptedDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/ngo/donations/accepted');
      setDonations(response.data.data || []);
    } catch (err) {
      console.error('❌ Error fetching accepted donations:', err);
      setError(err.response?.data?.message || 'Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (donationId, newStatus) => {
    try {
      await axios.put(`/ngo/donations/${donationId}/status`, { status: newStatus });
      alert(`Donation marked as ${newStatus.replace('_', ' ').toLowerCase()}`);
      fetchAcceptedDonations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getNavigationUrl = (donation) => {
    return `https://www.openstreetmap.org/directions?from=&to=${donation.pickupLocation.latitude},${donation.pickupLocation.longitude}#map=15/${donation.pickupLocation.latitude}/${donation.pickupLocation.longitude}`;
  };

  const filteredDonations = donations.filter(d => 
    filter === 'ALL' || d.status === filter
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-blue-100 text-blue-700';
      case 'PICKED_UP': return 'bg-orange-100 text-orange-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <button onClick={fetchAcceptedDonations} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">My Accepted Donations</h1>
        <p className="text-gray-600">Manage your accepted donations and pickups</p>
      </div>

      {/* Status Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'ACCEPTED', 'PICKED_UP', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Donations List */}
      {filteredDonations.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No donations found</h3>
          <p className="text-gray-600">
            {filter === 'ALL' 
              ? "You haven't accepted any donations yet"
              : `No donations with status: ${filter.replace('_', ' ')}`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDonations.map((donation) => (
            <div key={donation._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex gap-4">
                {/* Image */}
                {donation.images?.[0] ? (
                  <img
                    src={donation.images[0]}
                    alt={donation.itemCategory}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="text-gray-400" size={40} />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800">
                      {donation.itemCategory}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(donation.status)}`}>
                      {donation.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm mb-3">
                    <p className="text-gray-600">
                      <strong>Condition:</strong> {donation.condition.replace('_', ' ')}
                    </p>
                    <p className="text-gray-600">
                      <strong>Quantity:</strong> {donation.quantity}
                    </p>
                    {donation.description && (
                      <p className="text-gray-600 line-clamp-1">{donation.description}</p>
                    )}
                  </div>

                  {/* Contact Card */}
                  {donation.userId && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <User size={16} className="text-green-700" />
                        <span className="font-semibold text-green-900">{donation.userId.name}</span>
                      </div>
                      {donation.userId.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-green-600" />
                          <a 
                            href={`tel:${donation.userId.phone}`}
                            className="text-green-700 hover:underline text-sm"
                          >
                            {donation.userId.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-start text-sm text-gray-600 mb-3">
                    <MapPin size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{donation.pickupLocation.address}</span>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-gray-500 mb-3">
                    Accepted on {formatDate(donation.createdAt)}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <a
                      href={getNavigationUrl(donation)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      <Navigation size={16} />
                      Navigate
                    </a>

                    {donation.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleStatusUpdate(donation._id, 'PICKED_UP')}
                        className="btn-primary text-sm flex items-center gap-2 flex-1"
                      >
                        <CheckCircle size={16} />
                        Mark Picked Up
                      </button>
                    )}

                    {donation.status === 'PICKED_UP' && (
                      <button
                        onClick={() => handleStatusUpdate(donation._id, 'COMPLETED')}
                        className="btn-primary text-sm flex items-center gap-2 flex-1"
                      >
                        <CheckCircle size={16} />
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {donations.length > 0 && (
        <div className="card mt-8 bg-green-50">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-green-700">{donations.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Pending Pickup</p>
              <p className="text-2xl font-bold text-blue-700">
                {donations.filter(d => d.status === 'ACCEPTED').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-700">
                {donations.filter(d => d.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGOAcceptedDonations;