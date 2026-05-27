import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminTable from '../components/admin/AdminTable';
import axios from 'axios';

const AdminRecyclers = () => {
  const [recyclers, setRecyclers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [tabActive, setTabActive] = useState('pending');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [selectedRecycler, setSelectedRecycler] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (tabActive === 'pending') {
      fetchPendingRecyclers();
    } else {
      fetchVerifiedRecyclers();
    }
  }, [pagination.page, search, tabActive]);

  const fetchPendingRecyclers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('${import.meta.env.VITE_API_URL}/api/admin/recyclers/pending', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecyclers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching recyclers:', error);
      alert('Failed to fetch pending recyclers');
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedRecyclers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/recyclers/verified', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecyclers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching verified recyclers:', error);
      alert('Failed to fetch verified recyclers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recyclerId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `http://localhost:5000/api/admin/recyclers/${recyclerId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Recycler verified successfully');
      if (tabActive === 'pending') {
        fetchPendingRecyclers();
      } else {
        fetchVerifiedRecyclers();
      }
    } catch (error) {
      console.error('Error approving recycler:', error);
      alert('Failed to approve recycler');
    }
  };

  const handleRejectClick = (recycler) => {
    setSelectedRecycler(recycler);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `http://localhost:5000/api/admin/recyclers/${selectedRecycler._id}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Recycler verification rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRecycler(null);
      if (tabActive === 'pending') {
        fetchPendingRecyclers();
      } else {
        fetchVerifiedRecyclers();
      }
    } catch (error) {
      console.error('Error rejecting recycler:', error);
      alert('Failed to reject recycler');
    }
  };

  const pendingColumns = [
    { key: 'name', label: 'Recycler Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'locality', label: 'Locality' },
    {
      key: 'verificationRequestedAt',
      label: 'Requested Date',
      render: (value, row) => new Date(value).toLocaleDateString()
    }
  ];

  const verifiedColumns = [
    { key: 'name', label: 'Recycler Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'locality', label: 'Locality' },
    { key: 'rating', label: 'Rating', render: (value, row) => value.toFixed(1) },
    { key: 'completedRequests', label: 'Completed' },
    {
      key: 'verificationApprovedAt',
      label: 'Approved Date',
      render: (value, row) => new Date(value).toLocaleDateString()
    }
  ];

  const tableActions = (row) => {
    if (tabActive === 'pending') {
      return [
        {
          label: 'Approve',
          className: 'bg-green-100 text-green-700 hover:bg-green-200',
          onClick: () => handleApprove(row._id)
        },
        {
          label: 'Reject',
          className: 'bg-red-100 text-red-700 hover:bg-red-200',
          onClick: () => handleRejectClick(row)
        }
      ];
    }
    return [];
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">Recycler Verification</h1>
        <p className="text-gray-600">Approve or reject recycler registration requests</p>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setTabActive('pending');
              setPagination({ ...pagination, page: 1 });
            }}
            className={`px-6 py-3 font-semibold transition-colors ${
              tabActive === 'pending'
                ? 'border-b-2 border-eco-main text-eco-main'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Pending ({pagination.total || 0})
          </button>
          <button
            onClick={() => {
              setTabActive('verified');
              setPagination({ ...pagination, page: 1 });
            }}
            className={`px-6 py-3 font-semibold transition-colors ${
              tabActive === 'verified'
                ? 'border-b-2 border-eco-main text-eco-main'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Verified
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or locality..."
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

      {/* Recyclers Table */}
      <AdminTable
        columns={tabActive === 'pending' ? pendingColumns : verifiedColumns}
        data={recyclers}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        rowActions={tableActions}
        emptyMessage={tabActive === 'pending' ? 'No pending recycler verifications' : 'No verified recyclers'}
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-bold text-eco-dark mb-4">Reject Recycler Verification</h2>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">Recycler: {selectedRecycler?.name}</p>
              <p className="text-xs text-gray-600">{selectedRecycler?.email}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this recycler cannot be verified..."
                className="input-field"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedRecycler(null);
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRecyclers;
