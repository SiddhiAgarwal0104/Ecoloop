import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook for managing analytics data
 */
const useAnalytics = (filters = {}) => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [wasteTrends, setWasteTrends] = useState([]);
  const [wasteDistribution, setWasteDistribution] = useState([]);
  const [topLocalities, setTopLocalities] = useState([]);
  const [lowPerformingLocalities, setLowPerformingLocalities] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/admin';

  useEffect(() => {
    fetchAllAnalytics();
  }, [filters.startDate, filters.endDate]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const [dashboard, trends, distribution, topLoc, lowLoc, stats] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/dashboard`, { headers }),
        axios.get(`${API_BASE_URL}/analytics/waste-trends?${params}`, { headers }),
        axios.get(`${API_BASE_URL}/analytics/waste-distribution?${params}`, { headers }),
        axios.get(`${API_BASE_URL}/analytics/top-localities`, { headers }),
        axios.get(`${API_BASE_URL}/analytics/low-localities`, { headers }),
        axios.get(`${API_BASE_URL}/analytics/platform-stats?${params}`, { headers }),
      ]);

      setDashboardStats(dashboard.data.data);
      setWasteTrends(trends.data.data);
      setWasteDistribution(distribution.data.data);
      setTopLocalities(topLoc.data.data);
      setLowPerformingLocalities(lowLoc.data.data);
      setPlatformStats(stats.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to fetch analytics');
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchAllAnalytics();
  };

  return {
    dashboardStats,
    wasteTrends,
    wasteDistribution,
    topLocalities,
    lowPerformingLocalities,
    platformStats,
    loading,
    error,
    refetch,
  };
};

export default useAnalytics;