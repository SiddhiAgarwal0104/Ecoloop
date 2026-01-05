import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { confirmLend, confirmBorrow } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ConfirmationButtons = ({ chatRoom }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const userRole = chatRoom.participants.find(
    (p) => p.userId._id === user.id
  )?.role;

  const isLender = userRole === 'lender';
  const isBorrower = userRole === 'requester';

  const hasConfirmed = isLender
    ? chatRoom.lenderConfirmed
    : chatRoom.borrowerConfirmed;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      
      if (isLender) {
        await confirmLend(chatRoom._id);
        toast.success('You have confirmed to lend this item!');
      } else if (isBorrower) {
        await confirmBorrow(chatRoom._id);
        toast.success('You have confirmed to borrow this item!');
      }
    } catch (error) {
      toast.error('Failed to confirm. Please try again.');
      console.error('Confirmation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-700">
            {hasConfirmed ? (
              <span className="text-green-600 flex items-center gap-2">
                <CheckCircle size={18} />
                You have confirmed
              </span>
            ) : (
              'Confirm to proceed with lending'
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Both parties must confirm to finalize the lending
          </p>
        </div>

        {!hasConfirmed && (
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="btn-primary ml-4"
          >
            {loading ? 'Confirming...' : 'Confirm'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ConfirmationButtons;