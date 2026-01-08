import React, { useState, useEffect } from 'react';
import { Search, Filter, Star } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminTable from '../components/admin/AdminTable';
import axios from 'axios';

const AdminRecyclers = () => {
  const [recyclers, setRecyclers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [localityFilter, setLocalityFilter] = useState('');
  const [localities, setLocalities] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchLocalities();
  }, []);

  useEffect(() => {
    fetchRecyclers();
  }, [pagination.page, localityFilter]);

  const fetchRecyclers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/overview/recyclers', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          locality: localityFilter
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecyclers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching recyclers:', error);
      alert('Failed to fetch recyclers');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocalities = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/localities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocalities(response.data.data);
    } catch (error) {
      console.error('Error fetching localities:', error);
    }
  };

  const columns = [
    { key: 'name', label: 'Recycler Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'locality', label: 'Locality' },
    {
      key: 'totalPickups',
      label: 'Total Pickups',
      render: (row) => (
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
          {row.totalPickups || 0}
        </span>
      )
    },
    {
      key: 'averageRating',
      label: 'Rating',
      render: (row) => (
        <span className="flex items-center gap-1">
          <Star size={16} className="text-yellow-500 fill-current" />
          {row.averageRating?.toFixed(1) || 'N/A'} ({row.ratingCount || 0})
        </span>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">Recyclers Management</h1>
        <p className="text-gray-600">Monitor all recyclers on the platform</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search recyclers..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="input-field pl-10"
            />
          </div>

          {/* Locality Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={localityFilter}
              onChange={(e) => {
                setLocalityFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="input-field"
            >
              <option value="">All Localities</option>
              {localities.map((locality) => (
                <option key={locality} value={locality}>
                  {locality}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recyclers Table */}
      <AdminTable
        columns={columns}
        data={recyclers}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        emptyMessage="No recyclers found"
      />
    </AdminLayout>
  );
};

export default AdminRecyclers;
