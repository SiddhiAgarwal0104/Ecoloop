import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, TrendingDown, Users, Search, Filter } from 'lucide-react';
import axios from 'axios';

const LocalityAnalytics = () => {
  const [localities, setLocalities] = useState([]);
  const [filteredLocalities, setFilteredLocalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchLocalities();
  }, []);

  useEffect(() => {
    filterLocalities();
  }, [searchTerm, filterType, localities]);

  const fetchLocalities = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/localities?limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocalities(response.data.data);
      setFilteredLocalities(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching localities:', error);
      setLoading(false);
    }
  };

  const filterLocalities = () => {
    let filtered = localities;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterType === 'top') {
      filtered = filtered.filter(loc => loc.participationRate >= 70);
    } else if (filterType === 'low') {
      filtered = filtered.filter(loc => loc.participationRate < 30);
    } else if (filterType === 'medium') {
      filtered = filtered.filter(loc => loc.participationRate >= 30 && loc.participationRate < 70);
    }

    setFilteredLocalities(filtered);
  };

  const getPerformanceBadge = (rate) => {
    if (rate >= 70) return { bg: 'bg-green-100', text: 'text-green-700', label: 'Excellent' };
    if (rate >= 50) return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Good' };
    if (rate >= 30) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Average' };
    return { bg: 'bg-red-100', text: 'text-red-700', label: 'Needs Attention' };
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
        <h1 className="text-3xl font-bold text-eco-dark mb-2">Community Analytics</h1>
        <p className="text-gray-600">Track locality performance and participation rates</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search localities by name, city, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field"
            >
              <option value="all">All Localities</option>
              <option value="top">Top Performers (≥70%)</option>
              <option value="medium">Average (30-70%)</option>
              <option value="low">Needs Attention (&lt;30%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-green-50 to-white">
          <p className="text-sm text-gray-600 mb-1">Total Localities</p>
          <p className="text-3xl font-bold text-eco-dark">{localities.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-white">
          <p className="text-sm text-gray-600 mb-1">High Performers</p>
          <p className="text-3xl font-bold text-blue-600">
            {localities.filter(l => l.participationRate >= 70).length}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-white">
          <p className="text-sm text-gray-600 mb-1">Average</p>
          <p className="text-3xl font-bold text-yellow-600">
            {localities.filter(l => l.participationRate >= 30 && l.participationRate < 70).length}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-white">
          <p className="text-sm text-gray-600 mb-1">Needs Attention</p>
          <p className="text-3xl font-bold text-red-600">
            {localities.filter(l => l.participationRate < 30).length}
          </p>
        </div>
      </div>

      {/* Localities Table */}
      <div className="card overflow-hidden">
        <h2 className="text-xl font-bold text-eco-dark mb-4">
          Localities ({filteredLocalities.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-eco-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase tracking-wider">
                  Locality
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase tracking-wider">
                  Households
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase tracking-wider">
                  Active Users
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase tracking-wider">
                  Participation
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase tracking-wider">
                  Total Waste (kg)
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLocalities.map((locality) => {
                const badge = getPerformanceBadge(locality.participationRate);
                return (
                  <tr key={locality._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="text-eco-main mr-2" size={20} />
                        <div>
                          <p className="font-semibold text-eco-dark">{locality.name}</p>
                          <p className="text-xs text-gray-500">{locality.pincode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{locality.city}</p>
                      <p className="text-xs text-gray-500">{locality.state}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <p className="text-sm font-medium text-gray-900">{locality.totalHouseholds}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users size={16} className="text-gray-500" />
                        <p className="text-sm font-medium text-gray-900">{locality.activeUsers}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <p className="text-lg font-bold text-eco-main">
                          {locality.participationRate.toFixed(1)}%
                        </p>
                        {locality.participationRate >= 50 ? (
                          <TrendingUp size={16} className="text-green-500" />
                        ) : (
                          <TrendingDown size={16} className="text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <p className="text-sm font-semibold text-gray-900">
                        {locality.wasteStats?.totalWasteLogged?.toFixed(2) || 0}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLocalities.length === 0 && (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No localities found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalityAnalytics;