import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import NGORatingModal from '../components/NGORatingModal';
import axios from '../api/axios';
import { Package, MapPin, Calendar, Edit, Trash2, Star } from 'lucide-react';

const MyDonations = () => {
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
      console.log('📥 Fetching donations...');
      
      const response = await axios.get('/donations/my');
      console.log('✅ Donations received:', response.data);
      
      setDonations(response.data.data || []);
    } catch (err) {
      console.error('❌ Error fetching donations:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting donation:', id);
      await axios.delete(`/donations/${id}`);
      console.log('✅ Donation deleted');
      
      alert('Donation deleted successfully');
      fetchDonations(); // Refresh the list
    } catch (err) {
      console.error('❌ Error deleting donation:', err);
      alert(err.response?.data?.message || 'Failed to delete donation');
    }
  };

  const openRatingModal = (donation, ratingType) => {
    // NGO info is already populated in the donation object
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

  const filteredDonations = donations.filter(donation => {
    if (filter === 'ALL') return true;
    return donation.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-700';
      case 'PICKED_UP':
        return 'bg-orange-100 text-orange-700';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
            <button
              onClick={fetchDonations}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="fade-in max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-700 mb-2">My Donations</h1>
            <p className="text-gray-600">Track all your donation contributions</p>
          </div>
          <button
            onClick={() => navigate('/create-donation')}
            className="btn-primary"
          >
            + New Donation
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'COMPLETED'].map((status) => (
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
            <p className="text-gray-600 mb-6">
              {filter === 'ALL' 
                ? "You haven't created any donations yet"
                : `No donations with status: ${filter.replace('_', ' ')}`
              }
            </p>
            {filter === 'ALL' && (
              <button
                onClick={() => navigate('/create-donation')}
                className="btn-primary"
              >
                Create Your First Donation
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonations.map((donation) => (
              <div key={donation._id} className="card hover:shadow-lg transition-shadow">
                {/* Image */}
                {donation.images && donation.images.length > 0 && donation.images[0] ? (
                  <img
                    src={donation.images[0]}
                    alt={donation.itemCategory}
                    className="w-full h-48 object-cover rounded-t-xl mb-4"
                    onError={(e) => {
                      console.error('Image failed to load:', donation.images[0]);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-t-xl mb-4 flex items-center justify-center">
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
                      {donation.condition.replace('_', ' ')}
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
                    <span className="line-clamp-2">{donation.pickupLocation.address}</span>
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
                        className="flex-1 btn-secondary flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(donation._id)}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
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

                  {donation.status !== 'AVAILABLE' && !donation.assignedNGO && (
                    <button
                      onClick={() => navigate(`/donations/${donation._id}`)}
                      className="w-full btn-primary"
                    >
                      View Details
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
          <div className="card mt-8 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="text-3xl font-bold text-green-700">{donations.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-3xl font-bold text-green-700">
                  {donations.filter(d => d.status === 'AVAILABLE').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-700">
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