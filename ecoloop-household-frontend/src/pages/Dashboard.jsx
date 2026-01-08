import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Recycle, TrendingUp, Package, Award, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RewardsWidget from '../components/RewardsWidget';

/**
 * Dashboard Page Component - HOUSEHOLD
 * Main dashboard showing donations, recycles, and rewards
 */
const Dashboard = () => {
  const { api } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const response = await api.get('/dashboard/household');
      const data = response.data?.data || response.data;
      
      console.log('✅ Dashboard data loaded:', data);
      setDashboardData(data);
    } catch (err) {
      console.error('❌ Failed to load dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-eco-light border-t-eco-main"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border border-red-200 p-6">
        <p className="text-red-600 font-semibold">❌ {error}</p>
        <button onClick={fetchDashboard} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your eco-impact overview</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-eco-main text-white rounded-lg hover:bg-eco-dark transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Donations */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Donations</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {dashboardData?.stats?.totalDonations || 0}
              </p>
            </div>
            <Heart className="text-pink-500" size={40} />
          </div>
        </div>

        {/* Total Recycles */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Recycle Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {dashboardData?.stats?.totalRecycles || 0}
              </p>
            </div>
            <Recycle className="text-green-500" size={40} />
          </div>
        </div>

        {/* Impact Points */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-eco-main">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Impact Points</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {dashboardData?.stats?.totalPoints || 0}
              </p>
            </div>
            <TrendingUp className="text-eco-main" size={40} />
          </div>
        </div>

        {/* Active Items */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {(dashboardData?.stats?.activeDonations || 0) + (dashboardData?.stats?.activeRecycles || 0)}
              </p>
            </div>
            <Package className="text-blue-500" size={40} />
          </div>
        </div>
      </div>

      {/* Main Grid with Recent Items and Rewards Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Items (2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Donations */}
          <div className="card bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Heart className="text-pink-500" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Recent Donations</h2>
              </div>
              <Link to="/donations" className="text-eco-main font-semibold hover:text-eco-dark transition-colors">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.donations?.slice(0, 5).map((donation) => (
                <div key={donation._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
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
              {(!dashboardData?.donations || dashboardData.donations.length === 0) && (
                <div className="text-center py-8">
                  <Heart className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">No donations yet</p>
                  <Link to="/donations/create" className="text-eco-main font-semibold hover:text-eco-dark mt-2 inline-block">
                    Create your first donation →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Recycles */}
          <div className="card bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Recycle className="text-green-500" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Recent Recycle Requests</h2>
              </div>
              <Link to="/recycles" className="text-eco-main font-semibold hover:text-eco-dark transition-colors">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.recycles?.slice(0, 5).map((recycle) => (
                <div key={recycle._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
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
              {(!dashboardData?.recycles || dashboardData.recycles.length === 0) && (
                <div className="text-center py-8">
                  <Recycle className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">No recycle requests yet</p>
                  <Link to="/recycles/create" className="text-eco-main font-semibold hover:text-eco-dark mt-2 inline-block">
                    Create your first request →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Rewards Widget */}
        <div>
          <RewardsWidget />
        </div>
      </div>

      {/* Eco Impact Summary */}
      <div className="bg-gradient-to-r from-eco-main to-eco-dark rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Award className="text-white" size={32} />
          <div>
            <h2 className="text-2xl font-bold">Your Eco Impact</h2>
            <p className="text-eco-light">Making a difference, one action at a time</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-eco-light text-sm">Items Donated</p>
            <p className="text-3xl font-bold mt-1">{dashboardData?.stats?.totalDonations || 0}</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-eco-light text-sm">Waste Recycled</p>
            <p className="text-3xl font-bold mt-1">{dashboardData?.stats?.totalRecycles || 0}</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-eco-light text-sm">CO₂ Saved</p>
            <p className="text-3xl font-bold mt-1">{dashboardData?.stats?.co2Saved || 0} kg</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/donations/create" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
              <Heart className="text-pink-500" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Create Donation</h3>
              <p className="text-sm text-gray-600">Donate items to NGOs in need</p>
            </div>
          </div>
        </Link>

        <Link to="/recycles/create" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Recycle className="text-green-500" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Request Pickup</h3>
              <p className="text-sm text-gray-600">Schedule waste recycling pickup</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;