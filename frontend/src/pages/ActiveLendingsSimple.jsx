import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import Loader from '../components/shared/Loader';
import { getActiveLendings } from '../services/requestService';

const ActiveLendingsSimple = () => {
  const [lendings, setLendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLendings();
  }, []);

  const fetchLendings = async () => {
    try {
      setLoading(true);
      const response = await getActiveLendings();
      setLendings(response || []);
    } catch (error) {
      setLendings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-eco-light p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-eco-main transition-colors mb-4"
        >
          <span style={{fontSize:20,lineHeight:0}}>&larr;</span>
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold mb-4">Active Lendings (Simple)</h1>
        {loading ? (
          <Loader size="xl" />
        ) : lendings.length === 0 ? (
          <div className="card text-center py-12">
            <Package className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">No active lendings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lendings.map((lending) => (
              <div key={lending._id} className="card p-4">
                <div className="font-bold text-lg">{lending.itemName}</div>
                <div>Category: {lending.category}</div>
                <div>Status: {lending.status}</div>
                <div>Borrower: {lending.requesterId?.name || 'N/A'}</div>
                <div>From: {new Date(lending.startDate).toLocaleDateString()} To: {new Date(lending.endDate).toLocaleDateString()}</div>
                <div>Payment: {lending.paymentType === 'Free' ? 'Free' : `₹${lending.amount}`}</div>
                <button
                  className="btn-primary mt-3"
                  onClick={() => navigate(`/community/chat/${lending._id}`)}
                >
                  Open Chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveLendingsSimple;
