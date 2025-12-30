import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Package, MapPin, Search, Filter } from 'lucide-react';

const NGOAvailableDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [radius, setRadius] = useState(50);
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchAvailableDonations();
  }, [radius, category]);

  const fetchAvailableDonations = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query params
      const params = new URLSearchParams();
      if (radius) params.append('radius', radius);
      if (category) params.append('category', category);
      
      const response = await axios.get(`/ngo/donations/available?${params.toString()}`);
      setDonations(response.data.data || []);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card bg-red-50 border border-red-200">
          <h3 className="text-red-600 font-semibold mb-2">Failed to fetch donations</h3>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button onClick={fetchAvailableDonations} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Donations</h1>
        <p className="text-gray-600">Browse and accept donations near you</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Radius (km)
            </label>
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="input-field"
            >
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="FOOD">Food</option>
              <option value="CLOTHING">Clothing</option>
              <option value="BOOKS">Books</option>
              <option value="TOYS">Toys</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="FURNITURE">Furniture</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchAvailableDonations}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Donations Grid */}
      {donations.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No donations available
          </h3>
          <p className="text-gray-500">
            Try adjusting your search radius or check back later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <div key={donation._id} className="card hover:shadow-xl transition-shadow">
              {/* Image */}
              {donation.images?.[0] ? (
                <img
                  src={donation.images[0]}
                  alt={donation.itemCategory}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <Package className="text-gray-400" size={48} />
                </div>
              )}

              {/* Content */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-800">
                    {donation.itemCategory}
                  </h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                    {donation.distance} km
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Quantity: {donation.quantity}
                </p>
                {donation.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {donation.description}
                  </p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin size={14} className="mr-1" />
                  <span className="truncate">{donation.pickupLocation?.address}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleAcceptDonation(donation._id)}
                className="btn-primary w-full"
              >
                Accept Donation
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  async function handleAcceptDonation(donationId) {
    if (!confirm('Are you sure you want to accept this donation?')) return;

    try {
      await axios.post(`/ngo/donations/${donationId}/accept`);
      alert('Donation accepted successfully!');
      fetchAvailableDonations(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept donation');
    }
  }
};

export default NGOAvailableDonations;