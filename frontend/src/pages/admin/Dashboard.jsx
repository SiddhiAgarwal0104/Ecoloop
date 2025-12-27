import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Users, 
  Recycle, 
  TrendingUp, 
  MapPin, 
  Award,
  AlertCircle,
  Zap
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchAIInsights();
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
        <h1 className="text-3xl font-bold text-eco-dark mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor community performance and sustainability impact</p>
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

      {/* AI Insights Section */}
      {aiInsights && (
        <div className="card mb-8 bg-gradient-to-r from-eco-light to-white border-l-4 border-eco-main">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-eco-main p-2 rounded-lg">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-eco-dark">AI-Powered Insights</h2>
          </div>

          {/* High Waste Localities */}
          {aiInsights.summary.highWasteLocalities?.length > 0 && (
            <div className="mb-4 p-4 bg-orange-50 rounded-xl">
              <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <AlertCircle size={18} />
                High Waste Generation Detected
              </h3>
              {aiInsights.summary.highWasteLocalities.slice(0, 3).map((item, index) => (
                <div key={index} className="mb-2 text-sm">
                  <span className="font-medium">{item.locality.name}</span>
                  <span className="text-gray-600"> - {item.insight}</span>
                </div>
              ))}
            </div>
          )}

          {/* Low Participation */}
          {aiInsights.summary.lowParticipationLocalities?.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Users size={18} />
                Low Participation Alert
              </h3>
              {aiInsights.summary.lowParticipationLocalities.slice(0, 3).map((item, index) => (
                <div key={index} className="mb-2 text-sm">
                  <span className="font-medium">{item.locality.name}</span>
                  <span className="text-gray-600"> - {item.participationRate}% participation</span>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {aiInsights.recommendations?.length > 0 && (
            <div className="p-4 bg-green-50 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <Award size={18} />
                Recommended Actions
              </h3>
              {aiInsights.recommendations.map((rec, index) => (
                <div key={index} className="mb-2 text-sm">
                  <span className="font-medium text-eco-main">{rec.category}:</span>
                  <span className="text-gray-700"> {rec.action}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
};

export default Dashboard;