import React, { useEffect, useState } from 'react';
import { Eye, XCircle, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import Loader from '../components/shared/Loader';
import Modal from '../components/shared/Modal';
import RequestDetails from '../components/request/RequestDetails';

import { getMyRequests, cancelRequest } from '../services/requestService';

const MyRequests = () => {
  const navigate = useNavigate();

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
      // Filter out cancelled requests
      const activeRequests = (response || []).filter(r => r.status !== 'CANCELLED');
      setRequests(activeRequests);
    } catch (error) {
      toast.error('Failed to fetch your requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;

    try {
      setCancelLoading(true);
      await cancelRequest(requestId);
      
      // Immediately remove cancelled request from UI
      setRequests(prev => prev.filter(r => r._id !== requestId));
      setSelectedRequest(null);
      
      toast.success('Request cancelled successfully');
    } catch (error) {
      console.error('Cancel error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to cancel request';
      toast.error(errorMsg);
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
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-eco-main transition-colors mb-4"
        >
          <span style={{fontSize:20,lineHeight:0}}>&larr;</span>
          <span>Back</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-eco-dark mb-2">
            My Requests
          </h1>
          <p className="text-gray-600">
            View and manage your lending requests
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="xl" />
          </div>
        ) : requests.length === 0 ? (
          <div className="card text-center py-12">
            <Package className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">No requests yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map((request) => (
              <div key={request._id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-eco-dark mb-1">
                      {request.itemName}
                    </h3>
                    <span className="badge bg-primary-100 text-primary-700">
                      {request.category}
                    </span>
                  </div>

                  {/* Always show Open Chat for NEGOTIATING, handle chat room creation/navigation */}
                  {request.status === 'NEGOTIATING' ? (
                    <button
                      onClick={() => {
                        navigate(`/community/chat/${request._id}`);
                      }}
                      className={`badge ${statusColors.NEGOTIATING} cursor-pointer`}
                    >
                      Open Chat
                    </button>
                  ) : (
                    <span className={`badge ${statusColors[request.status]}`}>
                      {request.status}
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="btn-outline flex-1"
                  >
                    <Eye size={18} /> View Details
                  </button>

                  {['OPEN', 'NEGOTIATING'].includes(request.status) && (
                    <button
                      onClick={() => handleCancelRequest(request._id)}
                      disabled={cancelLoading}
                      className="btn-secondary flex-1 border-red-500 text-red-600"
                    >
                      <XCircle size={18} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={!!selectedRequest}
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
