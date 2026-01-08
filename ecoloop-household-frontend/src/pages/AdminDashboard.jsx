import React, { useState, useEffect } from 'react';
import { Users, Building2, Recycle, Gift, Star, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import StatsCard from '../components/admin/StatsCard';
import NGORatingsAdmin from '../components/NGORatingsAdmin';
import { getAllNGOs } from '../api/ngosAPI';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ngoLoading, setNgoLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [selectedNGOForRatings, setSelectedNGOForRatings] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchPlatformStats(),
        fetchVerifiedNGOs()
      ]);
    };
    fetchData();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      console.log('📡 [AdminDashboard] Fetching platform stats with token:', !!token);
      
      const response = await axios.get('http://localhost:5000/api/admin/stats/platform', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ [AdminDashboard] Platform stats fetched successfully:', response.data.data);
      
      if (response.data.data) {
        console.log('   - City:', response.data.data.city);
        console.log('   - Users:', response.data.data.users);
        console.log('   - Donations:', response.data.data.donations);
        console.log('   - Recycling:', response.data.data.recycling);
      }
      
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      console.error('❌ [AdminDashboard] Error fetching stats:', err);
      console.error('   - Status:', err.response?.status);
      console.error('   - Message:', err.response?.data?.message);
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedNGOs = async () => {
    try {
      setNgoLoading(true);
      console.log('🔍 [AdminDashboard] Fetching verified NGOs...');
      
      const result = await getAllNGOs({ limit: 50, sortBy: 'name' });
      
      if (result.success) {
        console.log('✅ [AdminDashboard] Verified NGOs fetched:', {
          count: result.data.length,
          ngos: result.data
        });
        setNgos(result.data || []);
      } else {
        console.error('❌ [AdminDashboard] Failed to fetch NGOs:', result.error);
        setNgos([]);
      }
    } catch (err) {
      console.error('❌ [AdminDashboard] Exception fetching NGOs:', err);
      setNgos([]);
    } finally {
      setNgoLoading(false);
    }
  };

  // Sort NGOs based on selected sort field
  const sortedNGOs = [...ngos].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'rating') {
      return b.averageRating - a.averageRating;
    } else if (sortBy === 'enrolled') {
      return b.enrolledDonations - a.enrolledDonations;
    }
    return 0;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="card bg-red-50 border-l-4 border-red-500">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-eco-dark mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to the EcoLoop Admin Control Center</p>
      </div>

      {/* Platform Stats - User Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-eco-dark mb-4">👥 Users Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatsCard
            title="Total Households"
            value={stats?.users?.totalHouseholds || 0}
            icon={Users}
            color="eco-main"
          />
          <StatsCard
            title="Total Recyclers"
            value={stats?.users?.totalRecyclers || 0}
            icon={Recycle}
            color="eco-main"
          />
          <StatsCard
            title="Verified Recyclers"
            value={stats?.users?.verifiedRecyclers || 0}
            icon={CheckCircle}
            color="eco-main"
          />
          <StatsCard
            title="Total NGOs"
            value={stats?.users?.totalNGOs || 0}
            icon={Building2}
            color="eco-main"
          />
          <StatsCard
            title="Verified NGOs"
            value={stats?.users?.verifiedNGOs || 0}
            icon={CheckCircle}
            color="eco-main"
          />
        </div>
      </div>

      {/* Donations vs Recycling - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Donations Section */}
        <div>
          <h2 className="text-2xl font-bold text-eco-dark mb-4">🎁 Donation Program Stats</h2>
          <div className="space-y-4">
            <StatsCard
              title="Total Donations"
              value={stats?.donations?.total || 0}
              icon={Gift}
              color="eco-main"
            />
            <StatsCard
              title="Completed Donations"
              value={stats?.donations?.completed || 0}
              icon={CheckCircle}
              color="eco-main"
            />
            <StatsCard
              title="Pending Donations"
              value={stats?.donations?.pending || 0}
              icon={Clock}
              color="eco-main"
            />
          </div>
        </div>

        {/* Recycling Section */}
        <div>
          <h2 className="text-2xl font-bold text-eco-dark mb-4">♻️ Recycling Program Stats</h2>
          <div className="space-y-4">
            <StatsCard
              title="Total Recycle Actions"
              value={stats?.recycling?.total || 0}
              icon={Recycle}
              color="eco-main"
            />
            <StatsCard
              title="Completed Pickups"
              value={stats?.recycling?.completed || 0}
              icon={CheckCircle}
              color="eco-main"
            />
            <StatsCard
              title="Pending Requests"
              value={stats?.recycling?.pending || 0}
              icon={Clock}
              color="eco-main"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions - Balanced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-4">
            <Building2 className="text-blue-600" size={32} />
            <span className="text-3xl font-bold text-blue-600">{stats?.users?.totalNGOs - stats?.users?.verifiedNGOs || 0}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending NGO Verifications</h3>
          <p className="text-gray-600 text-sm mb-4">Review and approve NGOs</p>
          <a href="/admin/ngos" className="btn btn-primary w-full text-center">Review Now</a>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
          <div className="flex items-start justify-between mb-4">
            <Recycle className="text-purple-600" size={32} />
            <span className="text-3xl font-bold text-purple-600">{stats?.recycling?.pending || 0}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Recycler Verifications</h3>
          <p className="text-gray-600 text-sm mb-4">Approve recycler profiles</p>
          <a href="/admin/recyclers" className="btn btn-primary w-full text-center">Review Now</a>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500">
          <div className="flex items-start justify-between mb-4">
            <Gift className="text-orange-600" size={32} />
            <span className="text-3xl font-bold text-orange-600">{stats?.donations?.pending || 0}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Donations</h3>
          <p className="text-gray-600 text-sm mb-4">Review donation pickups</p>
          <a href="/admin/donations" className="btn btn-primary w-full text-center">View Now</a>
        </div>
      </div>

      {/* Verified NGOs Listing */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-eco-dark">Verified NGOs</h2>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              console.log('🔄 [AdminDashboard] Sorting NGOs by:', e.target.value);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-main"
          >
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating (Highest)</option>
            <option value="enrolled">Sort by Enrolled Donations</option>
          </select>
        </div>

        {ngoLoading ? (
          <div className="card flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-eco-main"></div>
          </div>
        ) : sortedNGOs.length === 0 ? (
          <div className="card text-center py-12">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Verified NGOs Yet</h3>
            <p className="text-gray-500">NGOs will appear here once they are verified</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">NGO Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">City</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Enrolled</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Completed</th>
                </tr>
              </thead>
              <tbody>
                {sortedNGOs.map((ngo, index) => (
                  <tr key={ngo._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{ngo.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ngo.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ngo.city}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedNGOForRatings(ngo)}
                        className="flex items-center gap-1 hover:text-yellow-600 transition-colors"
                      >
                        <Star className="text-yellow-500 fill-yellow-500" size={16} />
                        <span className="font-semibold text-gray-800">{ngo.averageRating.toFixed(1)}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block bg-eco-light text-eco-main px-3 py-1 rounded-full font-semibold">
                        {ngo.enrolledDonations}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                        {ngo.completedDonations}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NGO Ratings Section */}
      {selectedNGOForRatings && (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-eco-dark">Ratings for {selectedNGOForRatings.name}</h2>
              <p className="text-gray-600 text-sm mt-1">View all feedback and ratings submitted by users</p>
            </div>
            <button
              onClick={() => setSelectedNGOForRatings(null)}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
          
          <NGORatingsAdmin ngoId={selectedNGOForRatings._id} ngoName={selectedNGOForRatings.name} />
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
