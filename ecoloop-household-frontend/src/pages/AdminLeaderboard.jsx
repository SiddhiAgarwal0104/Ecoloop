
import React, { useState, useEffect } from 'react';
import { Medal, MapPin } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import axios from 'axios';

const AdminLeaderboard = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboard, setLeaderboard] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [selectedLocality, setSelectedLocality] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    // Clear stale data whenever tab changes
    setLeaderboard([]);
    setPagination(prev => ({ ...prev, page: 1, total: 0, pages: 0 }));

    if (activeTab === 'global') {
      fetchGlobalLeaderboard();
    }
    // locality fetch will trigger via selectedLocality effect below
  }, [activeTab]);

  useEffect(() => {
    fetchLocalities();
  }, []);

  useEffect(() => {
    if (activeTab === 'locality' && selectedLocality) {
      fetchLocalityLeaderboard();
    }
  }, [activeTab, selectedLocality, pagination.page]);

  const fetchGlobalLeaderboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('${import.meta.env.VITE_API_URL}/api/admin/leaderboard/global', {
        params: {
          page: pagination.page,
          limit: pagination.limit
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setLeaderboard(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      alert('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocalityLeaderboard = async () => {
    if (!selectedLocality) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/leaderboard/locality/${encodeURIComponent(selectedLocality)}`,
        {
          params: { page: pagination.page, limit: pagination.limit },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setLeaderboard(response.data.data || []);
      if (response.data.pagination) setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching locality leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocalities = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('${import.meta.env.VITE_API_URL}/api/admin/localities', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLocalities(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedLocality(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching localities:', error);
    }
  };

  const getRankMedal = (rank) => {
    switch (rank) {
      case 1:
        return <Medal className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Medal className="text-orange-600" size={24} />;
      default:
        return <span className="text-lg font-bold text-gray-600">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-eco-main"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">Leaderboard</h1>
        <p className="text-gray-600">Track top households by donations and recycling activities</p>
      </div>

      {/* Tabs */}
      <div className="card mb-6 flex gap-4 border-b-2 border-gray-200">
        <button
          onClick={() => {
            setActiveTab('global');
            setPagination({ ...pagination, page: 1 });
          }}
          className={`px-6 py-3 font-semibold border-b-4 transition-colors ${
            activeTab === 'global'
              ? 'border-eco-main text-eco-main'
              : 'border-transparent text-gray-600 hover:text-eco-main'
          }`}
        >
          Global Leaderboard
        </button>
        <button
          onClick={() => {
            setActiveTab('locality');
            setPagination({ ...pagination, page: 1 });
          }}
          className={`px-6 py-3 font-semibold border-b-4 transition-colors ${
            activeTab === 'locality'
              ? 'border-eco-main text-eco-main'
              : 'border-transparent text-gray-600 hover:text-eco-main'
          }`}
        >
          Locality Leaderboard
        </button>
      </div>

      {/* Locality Filter */}
      {activeTab === 'locality' && (
        <div className="card mb-6">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-gray-500" />
            <select
              value={selectedLocality}
              onChange={(e) => {
                setSelectedLocality(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="input-field"
            >
              {localities.map((locality) => (
                <option key={locality} value={locality}>
                  {locality}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-eco-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase tracking-wider">
                  Household Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase tracking-wider">
                  Locality
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase tracking-wider">
                  Donations
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase tracking-wider">
                  Recycling Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase tracking-wider">
                  Total Actions
                </th>

              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              ) : (
                leaderboard.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRankMedal(user.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.locality}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                        {user.donations}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                        {user.recycleActions}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
                        {user.totalActions}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {leaderboard.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm font-semibold text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLeaderboard;
