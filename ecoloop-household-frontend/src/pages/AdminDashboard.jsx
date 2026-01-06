import React, { useState, useEffect } from 'react';
import { Users, Building2, Recycle, Gift } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import StatsCard from '../components/admin/StatsCard';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/stats/platform', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="grid grid-cols-1 gap-6">
        <StatsCard
          title="Total Recycle Actions"
          value={stats?.recycling?.total || 0}
          icon={Recycle}
          color="eco-main"
        />
      </div>

      {/* Quick Links */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </AdminLayout>
  );
};

export default AdminDashboard;
