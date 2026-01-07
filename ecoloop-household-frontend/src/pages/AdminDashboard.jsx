import React, { useState, useEffect } from 'react';
import { Users, Building2, Recycle, Gift, Star, MessageSquare } from 'lucide-react';
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
      const response = await axios.get('http://localhost:5000/api/admin/stats/platform', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 [AdminDashboard] Platform stats fetched:', response.data.data);
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      console.error('❌ [AdminDashboard] Error fetching stats:', err);
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

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Households"
          value={stats?.users?.totalHouseholds || 0}
          icon={Users}
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
          icon={Building2}
          color="eco-main"
        />
        <StatsCard
          title="Total Recyclers"
          value={stats?.users?.totalRecyclers || 0}
          icon={Recycle}
          color="eco-main"
        />
      </div>

      {/* Donations Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Donations"
          value={stats?.donations?.total || 0}
          icon={Gift}
          color="eco-main"
        />
        <StatsCard
          title="Completed Donations"
          value={stats?.donations?.completed || 0}
          icon={Gift}
          color="eco-main"
        />
        <StatsCard
          title="Pending Donations"
          value={stats?.donations?.pending || 0}
          icon={Gift}
          color="eco-main"
        />
      </div>

      {/* Recycling Stats */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <StatsCard
          title="Total Recycle Actions"
          value={stats?.recycling?.total || 0}
          icon={Recycle}
          color="eco-main"
        />
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-eco-dark mb-4">Pending NGO Verifications</h3>
          <p className="text-4xl font-bold text-eco-main mb-4">{stats?.users?.totalNGOs - stats?.users?.verifiedNGOs || 0}</p>
          <a
            href="/admin/ngos"
            className="btn-primary inline-block"
          >
            Review Now
          </a>
        </div>

        <div className="card text-center">
          <h3 className="text-lg font-semibold text-eco-dark mb-4">Pending Donations</h3>
          <p className="text-4xl font-bold text-orange-500 mb-4">{stats?.donations?.pending || 0}</p>
          <a
            href="/admin/donations"
            className="btn-primary inline-block"
          >
            View Donations
          </a>
        </div>

        <div className="card text-center">
          <h3 className="text-lg font-semibold text-eco-dark mb-4">Download Reports</h3>
          <p className="text-gray-600 mb-4">Generate weekly platform activity reports</p>
          <a
            href="/admin/reports"
            className="btn-primary inline-block"
          >
            Generate Report
          </a>
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
