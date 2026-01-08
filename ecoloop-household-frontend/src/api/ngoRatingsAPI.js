import axios from './axios';

export const ngoRatingsAPI = {
  // Submit rating and feedback for NGO
  submitRating: (donationId, ngoId, rating, feedback, ratingType, isAnonymous = false) => {
    const payload = {
      donationId,
      ngoId,
      rating,
      feedback,
      ratingType,
      isAnonymous
    };
    console.log('⭐ [ngoRatingsAPI] Submitting rating with payload:', payload);
    return axios.post('/ngo-ratings/submit', payload);
  },

  // Get all ratings for an NGO
  getNGORatings: (ngoId, page = 1, limit = 20, sortBy = 'createdAt') => {
    return axios.get(`/ngo-ratings/${ngoId}`, {
      params: { page, limit, sortBy }
    });
  },

  // Get rating summary for all NGOs (Admin)
  getRatingSummary: () => {
    return axios.get('/ngo-ratings/admin/summary');
  },

  // Delete a rating (Admin)
  deleteRating: (ratingId) => {
    return axios.delete(`/ngo-ratings/${ratingId}`);
  }
};
