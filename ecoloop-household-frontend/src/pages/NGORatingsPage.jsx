import React, { useState, useEffect } from 'react';
import { Building2, Star, ChevronDown, ChevronUp } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import { getAllNGOs } from '../api/ngosAPI';
import { ngoRatingsAPI } from '../api/ngoRatingsAPI';

const NGORatingsPage = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNGO, setExpandedNGO] = useState(null);
  const [ngoRatings, setNgoRatings] = useState({});
  const [loadingRatings, setLoadingRatings] = useState({});

  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      const result = await getAllNGOs({ limit: 100, sortBy: 'averageRating' });
      if (result.success) {
        setNgos(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch NGOs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNGORatings = async (ngoId) => {
    if (ngoRatings[ngoId]) {
      // Already loaded
      return;
    }

    try {
      setLoadingRatings(prev => ({ ...prev, [ngoId]: true }));
      const response = await ngoRatingsAPI.getNGORatings(ngoId, 1, 50);
      if (response.data.success) {
        setNgoRatings(prev => ({
          ...prev,
          [ngoId]: response.data
        }));
      }
    } catch (err) {
      console.error('Failed to fetch ratings for NGO:', err);
    } finally {
      setLoadingRatings(prev => ({ ...prev, [ngoId]: false }));
    }
  };

  const toggleNGOExpand = (ngoId) => {
    if (expandedNGO === ngoId) {
      setExpandedNGO(null);
    } else {
      setExpandedNGO(ngoId);
      fetchNGORatings(ngoId);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-eco-dark mb-2">NGO Ratings & Feedback</h1>
        <p className="text-gray-600">View all ratings and feedback submitted by users for each NGO</p>
      </div>

      {ngos.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No NGOs Found</h3>
          <p className="text-gray-500">No verified NGOs to display</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ngos.map((ngo) => (
            <div key={ngo._id} className="card">
              {/* NGO Header */}
              <button
                onClick={() => toggleNGOExpand(ngo._id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className="w-12 h-12 bg-eco-main rounded-full flex items-center justify-center text-white font-bold">
                    {ngo.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{ngo.name}</h3>
                    <p className="text-sm text-gray-600">{ngo.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Rating Stats */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={i < Math.floor(ngo.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-800 text-lg">{ngo.averageRating.toFixed(1)}</span>
                  </div>

                  {/* City */}
                  <div className="hidden md:block text-right">
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-semibold text-gray-800">{ngo.city}</p>
                  </div>

                  {/* Toggle Icon */}
                  <div className="text-eco-main">
                    {expandedNGO === ngo._id ? (
                      <ChevronUp size={24} />
                    ) : (
                      <ChevronDown size={24} />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Content - Ratings */}
              {expandedNGO === ngo._id && (
                <div className="border-t pt-4 mt-4">
                  {loadingRatings[ngo._id] ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-eco-main"></div>
                    </div>
                  ) : ngoRatings[ngo._id]?.data?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No ratings yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Stats Summary */}
                      {ngoRatings[ngo._id]?.stats && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-yellow-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Total Ratings</p>
                            <p className="text-2xl font-bold text-yellow-700">
                              {ngoRatings[ngo._id].stats.totalRatings}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Average</p>
                            <p className="text-2xl font-bold text-yellow-700">
                              {ngoRatings[ngo._id].stats.averageRating}
                            </p>
                          </div>
                          <div className="text-center hidden md:block">
                            <p className="text-sm text-gray-600">5 Stars</p>
                            <p className="text-2xl font-bold text-yellow-700">
                              {ngoRatings[ngo._id].stats.ratingBreakdown[5]}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Individual Ratings */}
                      <div className="space-y-3">
                        {ngoRatings[ngo._id]?.data?.map((rating) => (
                          <div
                            key={rating._id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {rating.user.name}
                                  {!rating.user.email && (
                                    <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                      Anonymous
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(rating.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={
                                      i < rating.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }
                                  />
                                ))}
                                <span className="ml-2 font-bold text-gray-700">{rating.rating}.0</span>
                              </div>
                            </div>

                            {/* Rating Type Badge */}
                            <div className="mb-2">
                              <span
                                className={`text-xs px-2 py-1 rounded font-semibold ${
                                  rating.ratingType === 'ITEM_RECEIVED'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {rating.ratingType === 'ITEM_RECEIVED' ? '✅ Item Received' : '❌ Cancelled'}
                              </span>
                            </div>

                            {/* Feedback */}
                            {rating.feedback && (
                              <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-400">
                                <p className="text-sm text-gray-700 italic">"{rating.feedback}"</p>
                              </div>
                            )}

                            {/* Donation Info */}
                            {rating.donation && (
                              <p className="text-xs text-gray-500 mt-2">
                                <strong>Item:</strong> {rating.donation.itemCategory} (Qty: {rating.donation.quantity})
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default NGORatingsPage;
