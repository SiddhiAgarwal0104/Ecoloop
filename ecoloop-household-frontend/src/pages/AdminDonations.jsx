import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminTable from '../components/admin/AdminTable';
import axios from 'axios';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchDonations();
  }, [pagination.page, statusFilter]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      console.log('📦 [AdminDonations] Fetching donations:', {
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        search
      });

      const response = await axios.get('http://localhost:5000/api/admin/donations', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: statusFilter,
          search
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ [AdminDonations] Donations received:', {
        count: response.data.data.length,
        total: response.data.pagination.total,
        data: response.data.data
      });

      setDonations(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('❌ [AdminDonations] Error fetching donations:', error);
      alert('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'AVAILABLE': 'bg-yellow-100 text-yellow-700',
      'ACCEPTED': 'bg-blue-100 text-blue-700',
      'PICKED_UP': 'bg-purple-100 text-purple-700',
      'COMPLETED': 'bg-green-100 text-green-700'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: 'itemCategory',
      label: 'Category'
    },
    {
      key: 'quantity',
      label: 'Quantity'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => getStatusBadge(value)
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value, row) => new Date(value).toLocaleDateString()
    },
    {
      key: 'userId',
      label: 'Household',
      render: (value, row) => value?.name || 'N/A'
    },
    {
      key: 'assignedNGO',
      label: 'Assigned NGO',
      render: (value, row) => value?.name || 'Not Assigned'
    }
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">Donations Management</h1>
        <p className="text-gray-600">Monitor all donations across the platform</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search donations..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <AdminTable
        columns={columns}
        data={donations}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        emptyMessage="No donations found"
      />
    </AdminLayout>
  );
};

export default AdminDonations;
