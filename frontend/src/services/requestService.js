import api from './api';

/**
 * Fetch all requests in user's locality
 */
export const getLocalityRequests = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    
    const response = await api.get(`/community/requests?${params}`);
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's own requests
 */
export const getMyRequests = async () => {
  try {
    const response = await api.get('/community/requests/my-requests');
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

/**
 * Get request details by ID
 */
export const getRequestById = async (requestId) => {
  try {
    const response = await api.get(`/community/requests/${requestId}`);
    return response.data.data || {};
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new request with image uploads
 */
export const createRequest = async (formData) => {
  try {
    // Use FormData for multipart/form-data to handle file uploads
    const data = new FormData();
    
    // Add form fields
    data.append('itemName', formData.itemName);
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('locality', formData.locality);
    data.append('pincode', formData.pincode);
    data.append('startDate', formData.startDate);
    data.append('endDate', formData.endDate);
    data.append('paymentType', formData.paymentType);
    data.append('amount', formData.amount || 0);
    
    // Add images
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((image) => {
        data.append('images', image);
      });
    }
    
    const response = await api.post('/community/requests', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || {};
  } catch (error) {
    throw error;
  }
};

/**
 * Show interest in a request (creates chat room)
 */
export const showInterest = async (requestId) => {
  try {
    const response = await api.post(`/community/requests/${requestId}/interest`);
    return response.data.data || {};
  } catch (error) {
    throw error;
  }
};

/**
 * Get active lendings for user
 */
export const getActiveLendings = async () => {
  try {
    const response = await api.get('/community/requests/active-lendings');
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

/**
 * Mark item as handed over
 */
export const markHandedOver = async (requestId) => {
  try {
    const response = await api.put(`/community/requests/${requestId}/handover`);
    return response.data.data || {};
  } catch (error) {
    throw error;
  }
};

/**
 * Mark item as returned
 */
export const markReturned = async (requestId) => {
  try {
    const response = await api.put(`/community/requests/${requestId}/return`);
    return response.data.data || {};
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel a request
 */
export const cancelRequest = async (requestId) => {
  try {
    const response = await api.delete(`/community/requests/${requestId}`);
    return response.data.data || {};
  } catch (error) {
    throw error;
  }
};
