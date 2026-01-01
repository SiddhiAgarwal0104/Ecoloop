import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Award, Zap } from 'lucide-react';
import axios from '../api/axios';
import { formatNumber, formatCurrency } from '../utils/helpers';

/**
 * Dashboard Page Component
 * Main dashboard with statistics and recent activity
 */
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      await fetchDashboard();
      // Fetch available requests after dashboard loads
      await fetchAvailableRequests();
    };
    loadDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/recycler/dashboard');
      const dashboardData = response.data?.data || response.data;
      console.log('✅ Dashboard data:', dashboardData);
      setStats(dashboardData);
    } catch (err) {
      console.error('❌ Failed to load dashboard:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        error: err
      });
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available requests from recycler backend (location-filtered)
  const fetchAvailableRequests = async () => {
    try {
      const response = await axios.get('/integration/recycle/available', {
        params: { limit: 10 }
      });
      console.log('✅ Available requests fetched:', response.data?.data);
      
      // Update stats with available requests
      setStats(prevStats => ({
        ...prevStats,
        availableRequests: response.data?.data || []
      }));
    } catch (err) {
      console.error('❌ Failed to fetch available requests:', err.message);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Fetch available requests separately
    setTimeout(() => {
      fetchAvailableRequests();
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-eco-light border-t-eco-main rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-600">❌ Failed to load dashboard. Please try again.</p>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-gray-500 text-center py-8">No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-eco-main text-white rounded-lg hover:bg-eco-dark transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Requests */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-eco-main">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.requests?.accepted || stats?.stats?.totalRequests || 0}</p>
            </div>
            <Activity className="text-eco-main" size={32} />
          </div>
        </div>

        {/* Completed Requests */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.requests?.recycled || stats?.stats?.completedRequests || 0}</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Picked Up</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.requests?.pickedUp || 0}</p>
            </div>
            <Zap className="text-blue-500" size={32} />
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.stats?.rating || 0}/5</p>
              <p className="text-xs text-gray-500 mt-1">{stats?.stats?.reviewCount || 0} reviews</p>
            </div>
            <Award className="text-yellow-500" size={32} />
          </div>
        </div>
      </div>

      {/* Waste Collected & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waste Collected */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Waste Collected</h2>
          <p className="text-4xl font-bold text-eco-main">{formatNumber(stats?.stats?.totalWasteCollected || 0)} KG</p>
          <p className="text-sm text-gray-600 mt-2">Total environmental impact</p>
        </div>

        {/* Waste by Category */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Waste by Category</h2>
          <div className="space-y-3">
            {stats.wasteByCategory && stats.wasteByCategory.length > 0 ? (
              (() => {
                const maxTotal = Math.max(...stats.wasteByCategory.map(w => w.total));
                return stats.wasteByCategory.map((item) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">{item._id}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-eco-main h-2 rounded-full"
                          style={{ width: `${(item.total / maxTotal) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-600 text-sm">{formatNumber(item.total)} KG</span>
                    </div>
                  </div>
                ));
              })()
            ) : (
              <p className="text-gray-500 text-center py-4">No waste data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Available Requests from Households */}
      {console.log('Debug - availableRequests:', stats?.availableRequests)}
      {stats?.availableRequests && Array.isArray(stats.availableRequests) && stats.availableRequests.length > 0 ? (
        <div className="bg-gradient-to-r from-eco-light to-eco-main rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Available Waste Requests</h2>
              <p className="text-eco-light mt-1">{stats.availableRequests.length} households waiting for pickup</p>
            </div>
            <a href="/requests" className="px-4 py-2 bg-white text-eco-main font-semibold rounded-lg hover:bg-eco-light transition-colors">
              View All →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {stats.availableRequests.slice(0, 3).map((request) => (
              <div key={request._id} className="bg-white bg-opacity-10 rounded-lg p-4 border border-white border-opacity-20 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">{request.wasteType || request.wasteCategory || 'Mixed Waste'}</h3>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-semibold">
                    {request.quantity || '1'} {request.unit || 'unit'}
                  </span>
                </div>
                <p className="text-sm text-eco-light mb-3">{request.description?.substring(0, 60) || 'No description'}...</p>
                <div className="flex items-center text-xs opacity-75">
                  <span>📍 {request.pickupLocation?.address || request.userId?.name || 'Location not specified'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-sm font-semibold text-gray-900 py-3">Category</th>
                <th className="text-left text-sm font-semibold text-gray-900 py-3">Quantity</th>
                <th className="text-left text-sm font-semibold text-gray-900 py-3">Status</th>
                <th className="text-left text-sm font-semibold text-gray-900 py-3">Accepted On</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentRequests && stats.recentRequests.length > 0 ? (
                stats.recentRequests.map((request) => (
                  <tr key={request._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="text-sm text-gray-900 py-4">{request.wasteCategory}</td>
                    <td className="text-sm text-gray-600 py-4">{request.quantity} {request.unit}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'RECYCLED' ? 'bg-green-100 text-green-800' :
                        request.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600 py-4">
                      {new Date(request.acceptedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500 py-8">
                    No requests yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
