import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from '../api/axios';
import { Heart, Recycle, TrendingUp, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/dashboard/household');
      console.log("Dashboard API:", response.data);
      setDashboardData(response.data.data);
      setError(null);
    } catch (error) {
      setError(error.message || 'Failed to load dashboard');
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
        </div>
      
    );
  }

  if (error) {
    return (
     
        <div className="card bg-red-50 border border-red-200 p-6">
          <p className="text-red-600 font-semibold">Error loading dashboard: {error}</p>
          <button onClick={fetchDashboard} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      
    );
  }

  const stats = dashboardData?.stats || {};

  return (
    
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-eco-dark mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your impact summary</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-eco-main p-3 rounded-xl">
                <Heart className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Donations</h3>
            <p className="text-3xl font-bold text-eco-dark">{stats.totalDonations || 0}</p>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Recycle className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Recycles</h3>
            <p className="text-3xl font-bold text-blue-700">{stats.totalRecycles || 0}</p>
          </div>

          <div className="card bg-gradient-to-br from-yellow-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500 p-3 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Active Donations</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.activeDonations || 0}</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-600 p-3 rounded-xl">
                <Package className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Active Recycles</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.activeRecycles || 0}</p>
          </div>
        </div>

        {/* Recent Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Donations */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-eco-dark">Recent Donations</h2>
              <Link to="/donations" className="text-eco-main font-semibold hover:text-eco-dark">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData?.donations?.slice(0, 5).map((donation) => (
                <div key={donation._id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{donation.itemCategory}</p>
                      <p className="text-sm text-gray-500">Qty: {donation.quantity}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      donation.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                      donation.status === 'ACCEPTED' ? 'bg-yellow-100 text-yellow-700' :
                      donation.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {donation.status}
                    </span>
                  </div>
                </div>
              ))}
              {!dashboardData?.donations?.length && (
                <p className="text-center text-gray-500 py-8">No donations yet</p>
              )}
            </div>
          </div>

          {/* Recent Recycles */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-eco-dark">Recent Recycles</h2>
              <Link to="/recycles" className="text-eco-main font-semibold hover:text-eco-dark">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData?.recycles?.slice(0, 5).map((recycle) => (
                <div key={recycle._id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{recycle.wasteCategory}</p>
                      <p className="text-sm text-gray-500">{recycle.quantity} {recycle.unit}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      recycle.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                      recycle.status === 'ACCEPTED' ? 'bg-yellow-100 text-yellow-700' :
                      recycle.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {recycle.status}
                    </span>
                  </div>
                </div>
              ))}
              {!dashboardData?.recycles?.length && (
                <p className="text-center text-gray-500 py-8">No recycle requests yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default Dashboard;
