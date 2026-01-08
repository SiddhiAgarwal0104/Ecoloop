import React, { useState, useEffect } from 'react';
import { Search, Star } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminTable from '../components/admin/AdminTable';
import axios from 'axios';

const AdminRecyclerRatings = () => {
  const [recyclers, setRecyclers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');
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
    fetchRecyclerRatings();
  }, [pagination.page, sortBy, localityFilter, search]);

  const fetchLocalities = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/localities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocalities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching localities:', error);
    }
  };

  const fetchRecyclerRatings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/ratings/recyclers-overview', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          sortBy,
          locality: localityFilter
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecyclers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching recycler ratings:', error);
      alert('Failed to fetch recycler ratings');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={`${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const columns = [
    { key: 'name', label: 'Recycler Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'locality', label: 'Locality' },
    { 
      key: 'rating', 
      label: 'Rating',
      render: (value, row) => renderStars(value)
    },
    { 
      key: 'completedRequests', 
      label: 'Completed Requests'
    },
    { 
      key: 'totalWasteCollected', 
      label: 'Waste Collected (kg)',
      render: (value, row) => value.toFixed(1)
    }
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">Recycler Ratings</h1>
        <p className="text-gray-600">View recycler performance and ratings</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
            className="input-field"
          >
            <option value="rating">Sort by Rating</option>
            <option value="completed">Sort by Completed Requests</option>
            <option value="waste">Sort by Waste Collected</option>
          </select>

          {/* Locality Filter */}
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

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="input-field pl-10"
            />
          </div>
        </div>
      </div>

      {/* Recycler Ratings Table */}
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

export default AdminRecyclerRatings;
