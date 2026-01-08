import { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, Eye } from 'lucide-react';
import { ngoRatingsAPI } from '../api/ngoRatingsAPI';

const NGORatingsAdmin = ({ ngoId, ngoName }) => {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedRating, setSelectedRating] = useState(null);

  useEffect(() => {
    fetchRatings();
  }, [ngoId, page]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await ngoRatingsAPI.getNGORatings(ngoId, page, 10, 'createdAt');
      if (response.data.success) {
        setRatings(response.data.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) return;

    try {
      const response = await ngoRatingsAPI.deleteRating(ratingId);
      if (response.data.success) {
        setRatings(ratings.filter(r => r._id !== ratingId));
        fetchRatings();
      }
    } catch (error) {
      console.error('Failed to delete rating:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-eco-main"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.floor(stats.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">{stats.averageRating}</p>
                <p className="text-sm text-yellow-600">{stats.totalRatings} ratings</p>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="card space-y-2">
            <h3 className="font-semibold text-gray-800 mb-3">Rating Distribution</h3>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 w-6">{rating}⭐</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${stats.totalRatings > 0 ? (stats.ratingBreakdown[rating] / stats.totalRatings) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 w-8 text-right">{stats.ratingBreakdown[rating]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ratings List */}
      <div className="card">
        <h3 className="text-lg font-bold text-eco-dark mb-4">All Ratings & Feedback</h3>

        {ratings.length === 0 ? (
          <div className="text-center py-12">
            <Star size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No ratings yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ratings.map((rating) => (
              <div
                key={rating._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* User & Date */}
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-gray-800">
                        {rating.user.name}
                        {!rating.user.email && (
                          <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            Anonymous
                          </span>
                        )}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{rating.rating}.0</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {rating.ratingType === 'ITEM_RECEIVED' ? '✅ Item Received' : '❌ Cancelled'}
                      </span>
                    </div>

                    {/* Feedback */}
                    {rating.feedback && (
                      <div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded mt-2 italic">
                          "{rating.feedback}"
                        </p>
                      </div>
                    )}

                    {/* Donation Info */}
                    {rating.donation && (
                      <p className="text-xs text-gray-500 mt-2">
                        <strong>Item:</strong> {rating.donation.itemCategory} (Qty: {rating.donation.quantity})
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedRating(rating)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteRating(rating._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete rating"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NGORatingsAdmin;
