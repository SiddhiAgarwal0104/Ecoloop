import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook for managing localities data
 */
const useLocalities = (filters = {}) => {
  const [localities, setLocalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchLocalities();
  }, [filters.page, filters.limit]);

  const fetchLocalities = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 50,
        ...(filters.city && { city: filters.city }),
        ...(filters.state && { state: filters.state }),
        ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      }).toString();

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/localities?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLocalities(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit || 50,
        total: response.data.total,
        pages: response.data.pages,
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching localities:', err);
      setError(err.response?.data?.message || 'Failed to fetch localities');
      setLoading(false);
    }
  };

  const searchLocalities = async (query) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/localities/search?query=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLocalities(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error searching localities:', err);
      setError(err.response?.data?.message || 'Search failed');
      setLoading(false);
    }
  };

  const getLocalityById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/localities/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.data;
    } catch (err) {
      console.error('Error fetching locality:', err);
      throw err;
    }
  };

  const getLocalityStats = async (id, startDate, endDate) => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/localities/${id}/stats?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.data;
    } catch (err) {
      console.error('Error fetching locality stats:', err);
      throw err;
    }
  };

  const refetch = () => {
    fetchLocalities();
  };

  return {
    localities,
    loading,
    error,
    pagination,
    searchLocalities,
    getLocalityById,
    getLocalityStats,
    refetch,
  };
};

export default useLocalities;