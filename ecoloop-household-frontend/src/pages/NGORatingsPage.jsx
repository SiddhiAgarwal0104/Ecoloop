import React, { useState, useEffect } from 'react';
import { Building2, Star, ChevronDown, ChevronUp } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import { ngoRatingsAPI } from '../api/ngoRatingsAPI';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Admin axios instance that reads the admin token, not the user token
 */
const adminAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

adminAxios.interceptors.request.use((config) => {
  // Try all possible admin token keys — check AdminLogin.jsx to confirm exact key
  const token =
    localStorage.getItem('adminToken') ||
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const NGORatingsPage = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNGO, setExpandedNGO] = useState(null);
  const [ngoRatings, setNgoRatings] = useState({});
  const [loadingRatings, setLoadingRatings] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      setError('');
      // Uses adminAxios so the admin JWT is sent, not the household user JWT
      const response = await adminAxios.get('/admin/ratings/ngos', {
        params: { page: 1, limit: 100 },
      });
      if (response.data.success) {
        setNgos(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch NGO ratings:', err);
      const status = err.response?.status;
      if (status === 403) {
        setError('Access denied. Please make sure you are logged in as an admin.');
      } else if (status === 500) {
        setError('Server error. Please check the backend logs.');
      } else {
        setError('Failed to load NGO ratings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNGORatings = async (ngoId) => {
    if (ngoRatings[ngoId]) return; // already loaded

    try {
      setLoadingRatings((prev) => ({ ...prev, [ngoId]: true }));
      const response = await ngoRatingsAPI.getNGORatings(ngoId, 1, 50);
      if (response.data.success) {
        setNgoRatings((prev) => ({ ...prev, [ngoId]: response.data }));
      }
    } catch (err) {
      console.error('Failed to fetch ratings for NGO:', ngoId, err);
    } finally {
      setLoadingRatings((prev) => ({ ...prev, [ngoId]: false }));
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
        <p className="text-gray-600">
          View all ratings and feedback submitted by users for each NGO
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 font-medium">❌ {error}</p>
        </div>
      )}

      {ngos.length === 0 && !error ? (
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
                  <div className="w-12 h-12 bg-eco-main rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {ngo.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{ngo.name}</h3>
                    <p className="text-sm text-gray-600">{ngo.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Star Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={
                            i < Math.floor(ngo.averageRating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-800 text-lg">
                      {(ngo.averageRating || 0).toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({ngo.ratingCount || 0})
                    </span>
                  </div>

                  {/* City */}
                  <div className="hidden md:block text-right">
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-semibold text-gray-800">{ngo.city || '—'}</p>
                  </div>

                  {/* Expand toggle */}
                  <div className="text-eco-main">
                    {expandedNGO === ngo._id ? (
                      <ChevronUp size={24} />
                    ) : (
                      <ChevronDown size={24} />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded — Individual Ratings */}
              {expandedNGO === ngo._id && (
                <div className="border-t pt-4 mt-2 px-4 pb-4">
                  {loadingRatings[ngo._id] ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-eco-main"></div>
                    </div>
                  ) : !ngoRatings[ngo._id]?.data?.length ? (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="mx-auto mb-2 text-gray-300" size={32} />
                      <p>No ratings yet for this NGO</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Stats Summary */}
                      {ngoRatings[ngo._id]?.stats && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-4 bg-yellow-50 rounded-lg">
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
                              {ngoRatings[ngo._id].stats.ratingBreakdown?.[5] || 0}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Individual Rating Cards */}
                      <div className="space-y-3">
                        {ngoRatings[ngo._id].data.map((rating) => (
                          <div
                            key={rating._id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {rating.user?.name || 'Anonymous'}
                                  {!rating.user?.email && (
                                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                      Anonymous
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(rating.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
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
                                <span className="ml-1 font-bold text-gray-700 text-sm">
                                  {rating.rating}.0
                                </span>
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
                                {rating.ratingType === 'ITEM_RECEIVED'
                                  ? '✅ Item Received'
                                  : '❌ Cancelled'}
                              </span>
                            </div>

                            {/* Feedback */}
                            {rating.feedback && (
                              <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-400">
                                <p className="text-sm text-gray-700 italic">
                                  "{rating.feedback}"
                                </p>
                              </div>
                            )}

                            {/* Donation Info */}
                            {rating.donation && (
                              <p className="text-xs text-gray-500 mt-2">
                                <strong>Item:</strong> {rating.donation.itemCategory}{' '}
                                (Qty: {rating.donation.quantity})
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