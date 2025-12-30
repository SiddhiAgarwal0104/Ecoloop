import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Users, 
  Recycle, 
  TrendingUp, 
  MapPin, 
  Award,
  AlertCircle,
  Zap,
  Share2
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);
  const [communityStats, setCommunityStats] = useState(null);
  const [adminCity, setAdminCity] = useState(null);

  useEffect(() => {
    // Get admin city from localStorage
    try {
      const adminData = localStorage.getItem('adminData');
      if (adminData && adminData !== 'undefined' && adminData !== 'null') {
        const parsedData = JSON.parse(adminData);
        setAdminCity(parsedData.assignedCity);
      }
    } catch (error) {
      console.error('Error parsing adminData:', error);
    }
    
    fetchDashboardData();
    fetchAIInsights();
    fetchCommunityStats();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/analytics/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchAIInsights = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/sustainability/ai-insights`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAiInsights(response.data.data);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    }
  };

  const fetchCommunityStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/community/stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCommunityStats(response.data.data);
    } catch (error) {
      console.error('Error fetching community stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-eco-dark mb-2">
              {adminCity ? `${adminCity} - Admin Dashboard` : 'Admin Dashboard'}
            </h1>
            <p className="text-gray-600">Monitor community performance and sustainability impact</p>
          </div>
          {adminCity && (
            <div className="bg-eco-light px-4 py-3 rounded-lg border border-eco-main">
              <p className="text-sm font-semibold text-eco-dark">City</p>
              <p className="text-xl font-bold text-eco-main">{adminCity}</p>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Waste Logged */}
        <div className="card bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-eco-main p-3 rounded-xl">
              <Recycle className="text-white" size={24} />
            </div>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              stats?.growth.waste >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {stats?.growth.waste >= 0 ? '+' : ''}{stats?.growth.waste}%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Waste Logged</h3>
          <p className="text-3xl font-bold text-eco-dark">{stats?.currentMonth.totalWaste} kg</p>
          <p className="text-xs text-gray-500 mt-2">This month</p>
        </div>

        {/* CO2 Saved */}
        <div className="card bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Leaf className="text-white" size={24} />
            </div>
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              Impact
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">CO₂ Saved</h3>
          <p className="text-3xl font-bold text-eco-dark">{stats?.currentMonth.totalCO2Saved} kg</p>
          <p className="text-xs text-gray-500 mt-2">Environmental benefit</p>
        </div>

        {/* Active Localities */}
        <div className="card bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-600 p-3 rounded-xl">
              <MapPin className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Active Localities</h3>
          <p className="text-3xl font-bold text-eco-dark">{stats?.overview.localities.active}</p>
          <p className="text-xs text-gray-500 mt-2">Out of {stats?.overview.localities.total} total</p>
        </div>

        {/* Energy Saved */}
        <div className="card bg-gradient-to-br from-yellow-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-600 p-3 rounded-xl">
              <Zap className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Energy Saved</h3>
          <p className="text-3xl font-bold text-eco-dark">{stats?.currentMonth.totalEnergySaved} kWh</p>
          <p className="text-xs text-gray-500 mt-2">Power conservation</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* NGOs */}
        <div className="card">
          <h3 className="text-lg font-semibold text-eco-dark mb-4">NGO Partners</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-eco-main">{stats?.overview.ngos.active}</p>
              <p className="text-sm text-gray-600">Active NGOs</p>
            </div>
            <div className="bg-eco-light p-4 rounded-full">
              <Users className="text-eco-main" size={28} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total Registered: <span className="font-semibold">{stats?.overview.ngos.total}</span>
            </p>
          </div>
        </div>

        {/* Recyclers */}
        <div className="card">
          <h3 className="text-lg font-semibold text-eco-dark mb-4">Recycler Partners</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-eco-main">{stats?.overview.recyclers.active}</p>
              <p className="text-sm text-gray-600">Active Recyclers</p>
            </div>
            <div className="bg-eco-light p-4 rounded-full">
              <Recycle className="text-eco-main" size={28} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total Registered: <span className="font-semibold">{stats?.overview.recyclers.total}</span>
            </p>
          </div>
        </div>

        {/* Landfill Reduced */}
        <div className="card">
          <h3 className="text-lg font-semibold text-eco-dark mb-4">Landfill Reduced</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-eco-main">{stats?.currentMonth.totalLandfillReduced}</p>
              <p className="text-sm text-gray-600">kg this month</p>
            </div>
            <div className="bg-eco-light p-4 rounded-full">
              <TrendingUp className="text-eco-main" size={28} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total Logs: <span className="font-semibold">{stats?.currentMonth.totalLogs}</span>
            </p>
          </div>
        </div>

        {/* Community Sharing */}
        <div className="card">
          <h3 className="text-lg font-semibold text-eco-dark mb-4">Community Sharing</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-eco-main">{communityStats?.stats.completedSharing || 0}</p>
              <p className="text-sm text-gray-600">Items shared</p>
            </div>
            <div className="bg-eco-light p-4 rounded-full">
              <Share2 className="text-eco-main" size={28} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Success Rate: <span className="font-semibold">{communityStats?.stats.successRate || 0}%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;