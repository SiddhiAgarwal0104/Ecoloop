import React, { useState, useEffect } from 'react';
import { Users, Recycle, Star, AlertCircle, CheckCircle, Phone, Mail } from 'lucide-react';
import axios from 'axios';

const PartnerMonitoring = () => {
  const [activeTab, setActiveTab] = useState('ngos');
  const [ngos, setNgos] = useState([]);
  const [recyclers, setRecyclers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/admin';
      
      const [ngosRes, recyclersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/ngo-recycler/ngos?limit=50`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/ngo-recycler/recyclers?limit=50`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setNgos(ngosRes.data.data || []);
      setRecyclers(recyclersRes.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getRatingStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const getStatusBadge = (isActive, isVerified) => {
    if (!isActive) {
      return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive', icon: AlertCircle };
    }
    if (!isVerified) {
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: AlertCircle };
    }
    return { bg: 'bg-green-100', text: 'text-green-700', label: 'Verified', icon: CheckCircle };
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
        <h1 className="text-3xl font-bold text-eco-dark mb-2">Partner Monitoring</h1>
        <p className="text-gray-600">Track NGO and Recycler partner performance and status</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('ngos')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'ngos'
              ? 'bg-eco-main text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Users size={20} />
          NGO Partners ({ngos.length})
        </button>
        <button
          onClick={() => setActiveTab('recyclers')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'recyclers'
              ? 'bg-eco-main text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Recycle size={20} />
          Recycler Partners ({recyclers.length})
        </button>
      </div>

      {/* NGOs Tab */}
      {activeTab === 'ngos' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="card bg-gradient-to-br from-green-50 to-white">
              <p className="text-sm text-gray-600 mb-1">Total NGOs</p>
              <p className="text-3xl font-bold text-eco-dark">{ngos.length}</p>
            </div>
            <div className="card bg-gradient-to-br from-blue-50 to-white">
              <p className="text-sm text-gray-600 mb-1">Verified</p>
              <p className="text-3xl font-bold text-blue-600">
                {ngos.filter(n => n.isVerified).length}
              </p>
            </div>
            <div className="card bg-gradient-to-br from-yellow-50 to-white">
              <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
              <p className="text-3xl font-bold text-yellow-600">
                {ngos.length > 0 ? (ngos.reduce((sum, n) => sum + (n.rating || 0), 0) / ngos.length).toFixed(1) : '0'}
              </p>
            </div>
            <div className="card bg-gradient-to-br from-purple-50 to-white">
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-purple-600">
                {ngos.filter(n => n.isActive).length}
              </p>
            </div>
          </div>

          {/* NGOs Table */}
          <div className="card overflow-hidden">
            <h2 className="text-xl font-bold text-eco-dark mb-4">NGO Partners</h2>
            {ngos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No NGO partners found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-eco-light">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase">
                        NGO Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
                        Collections
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
                        Waste Collected
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ngos.map((ngo) => {
                      const badge = getStatusBadge(ngo.isActive, ngo.isVerified);
                      const Icon = badge.icon;
                      return (
                        <tr key={ngo._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-eco-dark">{ngo.name}</p>
                              <p className="text-xs text-gray-500">
                                {ngo.address?.city}, {ngo.address?.state}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail size={14} className="text-gray-400" />
                                <span className="text-gray-700 truncate">{ngo.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone size={14} className="text-gray-400" />
                                <span className="text-gray-700">{ngo.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center">
                              <div className="flex gap-1 mb-1">
                                {getRatingStars(Math.round(ngo.rating || 0))}
                              </div>
                              <span className="text-sm font-semibold text-gray-700">
                                {(ngo.rating || 0).toFixed(1)} / 5.0
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <p className="text-sm font-semibold text-gray-900">
                              {ngo.performanceMetrics?.totalCollections || 0}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <p className="text-sm font-semibold text-eco-main">
                              {(ngo.performanceMetrics?.totalWasteCollected || 0).toFixed(2)} kg
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.bg} ${badge.text}`}>
                                <Icon size={14} />
                                {badge.label}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recyclers Tab */}
      {activeTab === 'recyclers' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="card bg-gradient-to-br from-green-50 to-white">
              <p className="text-sm text-gray-600 mb-1">Total Recyclers</p>
              <p className="text-3xl font-bold text-eco-dark">{recyclers.length}</p>
            </div>
            <div className="card bg-gradient-to-br from-blue-50 to-white">
              <p className="text-sm text-gray-600 mb-1">Verified</p>
              <p className="text-3xl font-bold text-blue-600">
                {recyclers.filter(r => r.isVerified).length}
              </p>
            </div>
            <div className="card bg-gradient-to-br from-yellow-50 to-white">
              <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
              <p className="text-3xl font-bold text-yellow-600">
                {recyclers.length > 0 ? (recyclers.reduce((sum, r) => sum + (r.rating || 0), 0) / recyclers.length).toFixed(1) : '0'}
              </p>
            </div>
            <div className="card bg-gradient-to-br from-purple-50 to-white">
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-purple-600">
                {recyclers.filter(r => r.isActive).length}
              </p>
            </div>
          </div>

          {/* Recyclers Table */}
          <div className="card overflow-hidden">
            <h2 className="text-xl font-bold text-eco-dark mb-4">Recycler Partners</h2>
            {recyclers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No recycler partners found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-eco-light">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase">
                        Recycler Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase">
                        Facility Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
                        Material Processed
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recyclers.map((recycler) => {
                      const badge = getStatusBadge(recycler.isActive, recycler.isVerified);
                      const Icon = badge.icon;
                      return (
                        <tr key={recycler._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-eco-dark">{recycler.name}</p>
                              <p className="text-xs text-gray-500">
                                {recycler.address?.city}, {recycler.address?.state}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize">
                              {(recycler.facilityType || '').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail size={14} className="text-gray-400" />
                                <span className="text-gray-700 truncate">{recycler.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone size={14} className="text-gray-400" />
                                <span className="text-gray-700">{recycler.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center">
                              <div className="flex gap-1 mb-1">
                                {getRatingStars(Math.round(recycler.rating || 0))}
                              </div>
                              <span className="text-sm font-semibold text-gray-700">
                                {(recycler.rating || 0).toFixed(1)} / 5.0
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <p className="text-sm font-semibold text-eco-main">
                              {(recycler.performanceMetrics?.totalMaterialProcessed || 0).toFixed(2)} kg
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.bg} ${badge.text}`}>
                                <Icon size={14} />
                                {badge.label}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerMonitoring;
