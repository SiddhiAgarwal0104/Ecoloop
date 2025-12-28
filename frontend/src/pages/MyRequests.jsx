import React, { useState, useEffect } from 'react';
import { Package, Eye, XCircle } from 'lucide-react';
import RequestDetails from '../components/request/RequestDetails';
import Modal from '../components/shared/Modal';
import Loader from '../components/shared/Loader';
import { getMyRequests, cancelRequest } from '../services/requestService';
import { toast } from 'react-toastify';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getMyRequests();
      setRequests(response);
    } catch (error) {
      toast.error('Failed to fetch your requests');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      setCancelLoading(true);
      await cancelRequest(requestId);
      toast.success('Request cancelled successfully');
      fetchRequests();
      setSelectedRequest(null);
    } catch (error) {
      toast.error('Failed to cancel request');
      console.error('Error:', error);
    } finally {
      setCancelLoading(false);
    }
  };

  const statusColors = {
    OPEN: 'badge-success',
    NEGOTIATING: 'badge-warning',
    CONFIRMED: 'badge-info',
    ACTIVE: 'badge-warning',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-danger',
  };

  return (
    <div className="min-h-screen bg-eco-light p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-eco-dark mb-2">My Requests</h1>
          <p className="text-gray-600">View and manage your lending requests</p>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="xl" />
          </div>
        ) : requests.length === 0 ? (
          <div className="card text-center py-12">
            <Package className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">No requests yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Create your first request to borrow items from your community
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map((request) => (
              <div
                key={request._id}
                className="card hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-eco-dark mb-1">
                      {request.itemName}
                    </h3>
                    <span className="badge bg-primary-100 text-primary-700">
                      {request.category}
                    </span>
                  </div>
                  <span className={`badge ${statusColors[request.status]}`}>
                    {request.status}
                  </span>
                </div>

                {request.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {request.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Duration:</span>{' '}
                    {new Date(request.startDate).toLocaleDateString()} -{' '}
                    {new Date(request.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Payment:</span>{' '}
                    {request.paymentType === 'Free' ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span className="text-primary-700">₹{request.amount}</span>
                    )}
                  </p>
                  {request.acceptedBy && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Lender:</span>{' '}
                      {request.acceptedBy.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="btn-outline flex-1 flex items-center justify-center gap-2"
                  >
                    <Eye size={18} />
                    <span>View Details</span>
                  </button>

                  {['OPEN', 'NEGOTIATING'].includes(request.status) && (
                    <button
                      onClick={() => handleCancelRequest(request._id)}
                      disabled={cancelLoading}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2 border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <XCircle size={18} />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        <Modal
          isOpen={selectedRequest !== null}
          onClose={() => setSelectedRequest(null)}
          title="Request Details"
          size="lg"
        >
          {selectedRequest && <RequestDetails request={selectedRequest} />}
        </Modal>
      </div>
    </div>
  );
};

export default MyRequests;