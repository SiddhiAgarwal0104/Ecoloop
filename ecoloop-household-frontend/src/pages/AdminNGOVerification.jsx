import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminTable from '../components/admin/AdminTable';
import axios from 'axios';

const AdminNGOVerification = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchPendingNGOs();
  }, [pagination.page, search]);

  const fetchPendingNGOs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('${import.meta.env.VITE_API_URL}/api/admin/ngos/pending', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setNgos(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching NGOs:', error);
      alert('Failed to fetch pending NGOs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ngoId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/ngos/${ngoId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('NGO verified successfully');
      fetchPendingNGOs();
    } catch (error) {
      console.error('Error approving NGO:', error);
      alert('Failed to approve NGO');
    }
  };

  const handleRejectClick = (ngo) => {
    setSelectedNGO(ngo);
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
        `${import.meta.env.VITE_API_URL}/api/admin/ngos/${selectedNGO._id}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('NGO verification rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedNGO(null);
      fetchPendingNGOs();
    } catch (error) {
      console.error('Error rejecting NGO:', error);
      alert('Failed to reject NGO');
    }
  };

  const columns = [
    { key: 'name', label: 'NGO Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'locality', label: 'Locality' },
    {
      key: 'city',
      label: 'City'
    }
  ];

  const tableActions = (row) => [
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

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">NGO Verification</h1>
        <p className="text-gray-600">Approve or reject pending NGO registration requests</p>
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

      {/* NGOs Table */}
      <AdminTable
        columns={columns}
        data={ngos}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        rowActions={tableActions}
        emptyMessage="No pending NGO verifications"
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-bold text-eco-dark mb-4">Reject NGO Verification</h2>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">NGO: {selectedNGO?.name}</p>
              <p className="text-xs text-gray-600">{selectedNGO?.email}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this NGO cannot be verified..."
                className="input-field"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedNGO(null);
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

export default AdminNGOVerification;
