import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook for managing Recycler data
 */
const useRecyclers = (filters = {}) => {
  const [recyclers, setRecyclers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchRecyclers();
  }, [filters.page, filters.limit, filters.isActive, filters.isVerified, filters.facilityType]);

  const fetchRecyclers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 50,
        ...(filters.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters.isVerified !== undefined && { isVerified: filters.isVerified }),
        ...(filters.facilityType && { facilityType: filters.facilityType }),
        ...(filters.city && { city: filters.city }),
        ...(filters.state && { state: filters.state }),
      }).toString();

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/ngo-recycler/recyclers?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRecyclers(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit || 50,
        total: response.data.total,
        pages: response.data.pages,
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recyclers:', err);
      setError(err.response?.data?.message || 'Failed to fetch recyclers');
      setLoading(false);
    }
  };

  const getRecyclerById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/ngo-recycler/recyclers/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.data;
    } catch (err) {
      console.error('Error fetching recycler:', err);
      throw err;
    }
  };

  const getTopRecyclers = async (limit = 10) => {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/ngo-recycler/recyclers/performance/top?limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.data;
    } catch (err) {
      console.error('Error fetching top recyclers:', err);
      throw err;
    }
  };

  const getUnderutilizedRecyclers = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/ngo-recycler/recyclers/performance/underutilized`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.data;
    } catch (err) {
      console.error('Error fetching underutilized recyclers:', err);
      throw err;
    }
  };

  const getRecyclersByFacilityType = async (facilityType) => {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/ngo-recycler/recyclers/facility/${facilityType}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.data;
    } catch (err) {
      console.error('Error fetching recyclers by facility type:', err);
      throw err;
    }
  };

  const refetch = () => {
    fetchRecyclers();
  };

  return {
    recyclers,
    loading,
    error,
    pagination,
    getRecyclerById,
    getTopRecyclers,
    getUnderutilizedRecyclers,
    getRecyclersByFacilityType,
    refetch,
  };
};

export default useRecyclers;