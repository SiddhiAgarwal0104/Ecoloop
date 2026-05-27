import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminTable from '../components/admin/AdminTable';
import axios from 'axios';

const AdminRecycles = () => {
  const [recycles, setRecycles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
    // Initial fetch with page 1
    fetchRecyclesData(1);
  }, []);

  useEffect(() => {
    // When filters change, reset to page 1 and fetch
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    } else {
      fetchRecyclesData(1);
    }
  }, [statusFilter, localityFilter, search]);

  useEffect(() => {
    // When page changes, fetch data
    if (pagination.page > 0) {
      fetchRecyclesData(pagination.page);
    }
  }, [pagination.page]);

  const fetchLocalities = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/localities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocalities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching localities:', error);
    }
  };

  const fetchRecyclesData = async (page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/recycles`, {
        params: {
          page: page,
          limit: 10,
          status: statusFilter || undefined,
          locality: localityFilter || undefined,
          search: search || undefined
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data.data || [];
      setRecycles(Array.isArray(data) ? data : []);
      setPagination(response.data.pagination || {
        page: page,
        limit: 10,
        total: data.length,
        pages: 1
      });
    } catch (error) {
      console.error('Error fetching recycles:', error);
      setRecycles([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'wasteType', label: 'Waste Type' },
    { key: 'quantity', label: 'Quantity', render: (value) => `${value} kg` },
    { 
      key: 'userId', 
      label: 'Requestor',
      render: (value) => {
        // Handle both object and string cases
        if (typeof value === 'object' && value?.name) return value.name;
        if (typeof value === 'string') return value;
        return 'Unknown';
      }
    },
    { 
      key: 'assignedRecycler', 
      label: 'Assigned Recycler',
      render: (value) => {
        // Handle both object and string cases
        if (typeof value === 'object' && value?.name) return value.name;
        if (typeof value === 'string') return value;
        return 'Unassigned';
      }
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'COMPLETED' ? 'bg-green-100 text-green-700' :
          value === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
          value === 'AVAILABLE' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'wasteCategory', 
      label: 'Category'
    },
    { 
      key: 'createdAt', 
      label: 'Created Date',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">Recycles Management</h1>
        <p className="text-gray-600">View and manage all waste recycling requests</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by waste type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Locality Filter */}
          <select
            value={localityFilter}
            onChange={(e) => setLocalityFilter(e.target.value)}
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

      {/* Recycles Table */}
      <AdminTable
        columns={columns}
        data={recycles}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        emptyMessage="No recycles found"
      />
    </AdminLayout>
  );
};

export default AdminRecycles;
