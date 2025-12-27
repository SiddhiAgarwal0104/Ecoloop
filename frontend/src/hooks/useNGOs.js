import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook for managing NGO data
 */
const useNGOs = (filters = {}) => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchNGOs();
  }, [filters.page, filters.limit, filters.isActive, filters.isVerified]);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 50,
        ...(filters.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters.isVerified !== undefined && { isVerified: filters.isVerified }),
        ...(filters.city && { city: filters.city }),
        ...(filters.state && { state: filters.state }),
      }).toString();

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/ngo-recycler/ngos?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNgos(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit || 50,
        total: response.data.total,
        pages: response.data.pages,
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching NGOs:', err);
      setError(err.response?.data?.message || 'Failed to fetch NGOs');
      setLoading(false);
    }
  };

  const getNGOById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/ngo-recycler/ngos/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.data;
    } catch (err) {
      console.error('Error fetching NGO:', err);
      throw err;
    }
  };

  const getTopNGOs = async (limit = 10) => {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/ngo-recycler/ngos/performance/top?limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.data;
    } catch (err) {
      console.error('Error fetching top NGOs:', err);
      throw err;
    }
  };

  const getNGOsNeedingAttention = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/ngo-recycler/ngos/performance/attention`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.data;
    } catch (err) {
      console.error('Error fetching NGOs needing attention:', err);
      throw err;
    }
  };

  const refetch = () => {
    fetchNGOs();
  };

  return {
    ngos,
    loading,
    error,
    pagination,
    getNGOById,
    getTopNGOs,
    getNGOsNeedingAttention,
    refetch,
  };
};

export default useNGOs;