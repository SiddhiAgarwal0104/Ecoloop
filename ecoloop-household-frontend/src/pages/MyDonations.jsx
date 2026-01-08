import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Calendar, Edit, Trash2, Star, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NGORatingModal from '../components/NGORatingModal';

/**
 * My Donations Page - Household
 * View and manage all donations
 */
const MyDonations = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    donation: null,
    ngoInfo: null,
    ratingType: null
  });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/donations/my');
      console.log('✅ Donations loaded:', response.data);
      
      const data = response.data?.data || response.data?.donations || [];
      setDonations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching donations:', err);
      setError(err.response?.data?.message || 'Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this donation?')) return;

    try {
      console.log('🗑️ Deleting donation:', id);
      await api.delete(`/donations/${id}`);
      
      alert('Donation deleted successfully');
      fetchDonations();
    } catch (err) {
      console.error('❌ Error deleting donation:', err);
      alert(err.response?.data?.message || 'Failed to delete donation');
    }
  };

  const openRatingModal = (donation, ratingType) => {
    if (!donation.assignedNGO) {
      alert('NGO information not available');
      return;
    }

    setRatingModal({
      isOpen: true,
      donation,
      ngoInfo: donation.assignedNGO,
      ratingType
    });
  };

  const closeRatingModal = () => {
    setRatingModal({
      isOpen: false,
      donation: null,
      ngoInfo: null,
      ratingType: null
    });
  };

  const handleRatingSuccess = () => {
    alert('Rating submitted successfully!');
    fetchDonations();
    closeRatingModal();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700';
      case 'ACCEPTED':
        return 'bg-yellow-100 text-yellow-700';
      case 'PICKED_UP':
        return 'bg-blue-100 text-blue-700';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredDonations = donations.filter(donation => {
    if (filter === 'ALL') return true;
    return donation.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-eco-light border-t-eco-main"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Donations</h1>
          <p className="text-gray-600 mt-1">Manage and track your donations</p>
        </div>
        <button
          onClick={() => navigate('/donations/create')}
          className="px-4 py-2 bg-eco-main text-white rounded-lg hover:bg-eco-dark transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          New Donation
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-semibold">❌ {error}</p>
          <button onClick={fetchDonations} className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === status
                  ? 'bg-eco-main text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Donations Grid */}
      {filteredDonations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No donations found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'ALL' 
              ? "You haven't created any donations yet"
              : `No donations with status: ${filter.replace('_', ' ')}`
            }
          </p>
          {filter === 'ALL' && (
            <button
              onClick={() => navigate('/donations/create')}
              className="px-6 py-3 bg-eco-main text-white rounded-lg hover:bg-eco-dark transition-colors font-medium"
            >
              Create Your First Donation
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((donation) => (
            <div key={donation._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              {/* Image */}
              {donation.images && donation.images.length > 0 ? (
                <img
                  src={donation.images[0]}
                  alt={donation.itemCategory}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Package className="text-gray-400" size={48} />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800">
                    {donation.itemCategory}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(donation.status)}`}>
                    {donation.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <strong className="mr-2">Condition:</strong>
                    {donation.condition?.replace('_', ' ')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <strong className="mr-2">Quantity:</strong>
                    {donation.quantity}
                  </div>
                  {donation.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {donation.description}
                    </p>
                  )}
                </div>

                <div className="flex items-start text-sm text-gray-600 mb-3">
                  <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{donation.pickupLocation?.address}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar size={16} className="mr-2" />
                  {formatDate(donation.createdAt)}
                </div>

                {/* Actions */}
                {donation.status === 'AVAILABLE' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/donations/${donation._id}/edit`)}
                      className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(donation._id)}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )}

                {donation.status === 'COMPLETED' && donation.assignedNGO && (
                  <button
                    onClick={() => openRatingModal(donation, 'ITEM_RECEIVED')}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Star size={16} />
                    Rate NGO
                  </button>
                )}

                {(donation.status === 'ACCEPTED' || donation.status === 'PICKED_UP') && donation.assignedNGO && (
                  <button
                    onClick={() => openRatingModal(donation, 'DONATION_CANCELLED')}
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
      )}

      {/* Rating Modal */}
      {ratingModal.isOpen && ratingModal.donation && ratingModal.ngoInfo && (
        <NGORatingModal
          donation={ratingModal.donation}
          ngoInfo={ratingModal.ngoInfo}
          ratingType={ratingModal.ratingType}
          onClose={closeRatingModal}
          onSuccess={handleRatingSuccess}
        />
      )}

      {/* Summary */}
      {donations.length > 0 && (
        <div className="bg-gradient-to-r from-eco-light to-eco-main rounded-lg shadow p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm opacity-90">Total</p>
              <p className="text-3xl font-bold">{donations.length}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Available</p>
              <p className="text-3xl font-bold">
                {donations.filter(d => d.status === 'AVAILABLE').length}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-90">In Progress</p>
              <p className="text-3xl font-bold">
                {donations.filter(d => d.status === 'ACCEPTED' || d.status === 'PICKED_UP').length}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-90">Completed</p>
              <p className="text-3xl font-bold">
                {donations.filter(d => d.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDonations;