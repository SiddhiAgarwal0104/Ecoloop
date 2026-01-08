import axios from './axios';

export const recyclerRatingsAPI = {
  // Submit rating and feedback for Recycler
  submitRating: (recycleId, recyclerId, rating, feedback, ratingType, isAnonymous = false) => {
    const payload = {
      recycleId,
      recyclerId,
      rating,
      feedback,
      ratingType,
      isAnonymous
    };
    console.log('⭐ [recyclerRatingsAPI] Submitting rating with payload:', payload);
    return axios.post('/recycler-ratings/submit', payload);
  },

  // Get all ratings for a Recycler
  getRecyclerRatings: (recyclerId, page = 1, limit = 20, sortBy = 'createdAt') => {
    return axios.get(`/recycler-ratings/${recyclerId}`, {
      params: { page, limit, sortBy }
    });
  },

  // Get rating summary for all Recyclers (Admin)
  getRatingSummary: () => {
    return axios.get('/recycler-ratings/admin/summary');
  },

  // Delete a rating (Admin)
  deleteRating: (ratingId) => {
    return axios.delete(`/recycler-ratings/${ratingId}`);
  }
};
