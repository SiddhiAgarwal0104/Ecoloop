import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle } from 'lucide-react';
import RequestDetails from '../components/request/RequestDetails';
import Modal from '../components/shared/Modal';
import Loader from '../components/shared/Loader';
import {
  getActiveLendings,
  markHandedOver,
  markReturned,
} from '../services/requestService';
import { toast } from 'react-toastify';

const ActiveLendings = () => {
  const [lendings, setLendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLending, setSelectedLending] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLendings();
  }, []);

  const fetchLendings = async () => {
    try {
      setLoading(true);
      const response = await getActiveLendings();
      setLendings(response);
    } catch (error) {
      toast.error('Failed to fetch active lendings');
      console.error('Error fetching lendings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHandedOver = async (lendingId) => {
    try {
      setActionLoading(true);
      await markHandedOver(lendingId);
      toast.success('Item marked as handed over!');
      fetchLendings();
      setSelectedLending(null);
    } catch (error) {
      toast.error('Failed to mark as handed over');
      console.error('Error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReturned = async (lendingId) => {
    try {
      setActionLoading(true);
      await markReturned(lendingId);
      toast.success('Item marked as returned! Lending completed.');
      fetchLendings();
      setSelectedLending(null);
    } catch (error) {
      toast.error('Failed to mark as returned');
      console.error('Error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-eco-light p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-eco-dark mb-2">
            Active Lendings
          </h1>
          <p className="text-gray-600">
            Manage your ongoing lending activities
          </p>
        </div>

        {/* Lendings List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="xl" />
          </div>
        ) : lendings.length === 0 ? (
          <div className="card text-center py-12">
            <Package className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">No active lendings</p>
            <p className="text-gray-400 text-sm mt-2">
              Your confirmed lendings will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {lendings.map((lending) => (
              <div
                key={lending._id}
                className="card hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-eco-dark mb-1">
                      {lending.itemName}
                    </h3>
                    <span className="badge bg-primary-100 text-primary-700">
                      {lending.category}
                    </span>
                  </div>
                  <span
                    className={`badge ${
                      lending.status === 'CONFIRMED'
                        ? 'badge-info'
                        : 'badge-warning'
                    }`}
                  >
                    {lending.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Borrower:</span>{' '}
                    {lending.requesterId.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Duration:</span>{' '}
                    {new Date(lending.startDate).toLocaleDateString()} -{' '}
                    {new Date(lending.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Payment:</span>{' '}
                    {lending.paymentType === 'Free' ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span className="text-primary-700">₹{lending.amount}</span>
                    )}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedLending(lending)}
                    className="btn-outline flex-1"
                  >
                    View Details
                  </button>

                  {lending.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleMarkHandedOver(lending._id)}
                      disabled={actionLoading}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      <span>Hand Over</span>
                    </button>
                  )}

                  {lending.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleMarkReturned(lending._id)}
                      disabled={actionLoading}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      <span>Mark Returned</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        <Modal
          isOpen={selectedLending !== null}
          onClose={() => setSelectedLending(null)}
          title="Lending Details"
          size="lg"
        >
          {selectedLending && <RequestDetails request={selectedLending} />}
        </Modal>
      </div>
    </div>
  );
};

export default ActiveLendings;