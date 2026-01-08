import { useState } from 'react';
import { Star, MessageSquare, X } from 'lucide-react';
import { recyclerRatingsAPI } from '../api/recyclerRatingsAPI';

const RecyclerRatingModal = ({ recycle, recyclerInfo, ratingType, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      console.log('⭐ [Recycler Rating Modal] Submitting rating with:', {
        recycleId: recycle._id,
        recyclerId: recyclerInfo._id,
        rating,
        feedback,
        ratingType,
        isAnonymous,
        recyclerInfo
      });

      const response = await recyclerRatingsAPI.submitRating(
        recycle._id,
        recyclerInfo._id,
        rating,
        feedback,
        ratingType,
        isAnonymous
      );

      if (response.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('⭐ [Recycler Rating Modal] Error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const ratingTitle = ratingType === 'PICKUP_COMPLETED' 
    ? 'Rate your experience with this recycler' 
    : 'Your feedback about the cancellation';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-eco-main to-eco-dark text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{ratingTitle}</h2>
            <p className="text-eco-light text-sm mt-1">{recyclerInfo.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Recycle Request Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Category:</span> {recycle.wasteCategory}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Quantity:</span> {recycle.quantity} {recycle.unit}
            </p>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {rating > 0 ? `${rating} out of 5 stars` : 'Select a rating'}
            </p>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MessageSquare size={16} />
              Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience, suggestions, or concerns..."
              maxLength={1000}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-main text-sm resize-none"
            />
            <p className="text-xs text-gray-500">{feedback.length}/1000 characters</p>
          </div>

          {/* Anonymous Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-700">Submit anonymously</span>
          </label>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 px-4 py-2 bg-eco-main text-white rounded-lg font-semibold hover:bg-eco-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecyclerRatingModal;
