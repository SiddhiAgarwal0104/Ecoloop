import axiosInstance from './axios';

/**
 * Fetch all verified NGOs from the backend
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.search - Search query (optional)
 * @param {string} options.sortBy - Sort field: 'name', 'averageRating', 'city', 'createdAt' (default: 'name')
 * @returns {Promise<Array>} Array of verified NGO objects
 */
export const getAllNGOs = async (options = {}) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      search = '', 
      sortBy = 'name' 
    } = options;

    console.log('🔍 [NGO API] Fetching all verified NGOs:', { page, limit, search, sortBy });

    // Build query params
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (search) params.append('search', search);
    params.append('sortBy', sortBy);

    const response = await axiosInstance.get(`/ngo?${params.toString()}`);

    console.log('✅ [NGO API] Successfully fetched NGOs:', {
      count: response.data.count,
      total: response.data.pagination?.total,
      dataLength: response.data.data?.length,
      firstNGO: response.data.data?.[0]
    });

    // Ensure data is always an array
    const ngoData = Array.isArray(response.data.data) ? response.data.data : [];

    return {
      success: true,
      data: ngoData,
      pagination: response.data.pagination || {
        page,
        limit,
        total: ngoData.length,
        pages: 1
      },
      count: ngoData.length
    };
  } catch (error) {
    console.error('❌ [NGO API] Error fetching NGOs:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });

    return {
      success: false,
      data: [],
      error: error.response?.data?.message || error.message || 'Failed to fetch NGOs',
      pagination: {
        page: 1,
        limit: 100,
        total: 0,
        pages: 0
      },
      count: 0
    };
  }
};

/**
 * Fetch a single NGO by ID
 * @param {string} ngoId - The NGO user ID
 * @returns {Promise<Object>} NGO object with details
 */
export const getNGOById = async (ngoId) => {
  try {
    console.log('🔍 [NGO API] Fetching NGO by ID:', ngoId);

    const response = await axiosInstance.get(`/ngos/${ngoId}`);

    console.log('✅ [NGO API] Successfully fetched NGO:', response.data.data);

    return {
      success: true,
      data: response.data.data || {}
    };
  } catch (error) {
    console.error('❌ [NGO API] Error fetching NGO by ID:', {
      ngoId,
      message: error.message,
      response: error.response?.data
    });

    return {
      success: false,
      data: {},
      error: error.response?.data?.message || error.message || 'Failed to fetch NGO'
    };
  }
};

/**
 * Search NGOs by name or city
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching NGOs
 */
export const searchNGOs = async (query) => {
  try {
    console.log('🔍 [NGO API] Searching NGOs:', query);

    const response = await axiosInstance.get(`/ngos?search=${encodeURIComponent(query)}&limit=50`);

    console.log('✅ [NGO API] Search results:', {
      count: response.data.count,
      data: response.data.data
    });

    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('❌ [NGO API] Error searching NGOs:', {
      query,
      message: error.message
    });

    return {
      success: false,
      data: [],
      error: error.message || 'Failed to search NGOs'
    };
  }
};

/**
 * Get top-rated NGOs
 * @param {number} limit - Number of NGOs to fetch (default: 5)
 * @returns {Promise<Array>} Array of top-rated NGOs
 */
export const getTopRatedNGOs = async (limit = 5) => {
  try {
    console.log('🔍 [NGO API] Fetching top-rated NGOs:', limit);

    const response = await axiosInstance.get(`/ngos?limit=${limit}&sortBy=averageRating`);

    console.log('✅ [NGO API] Top-rated NGOs:', response.data.data);

    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('❌ [NGO API] Error fetching top-rated NGOs:', error.message);

    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch top-rated NGOs'
    };
  }
};

export default {
  getAllNGOs,
  getNGOById,
  searchNGOs,
  getTopRatedNGOs
};
