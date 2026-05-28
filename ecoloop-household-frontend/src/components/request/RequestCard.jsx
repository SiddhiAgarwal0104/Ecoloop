import { MapPin, Calendar, DollarSign, User, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateRange, getDaysDifference } from '../../utils/dateFormatter';
import api from '../../services/api';

const RequestCard = ({ request, onInterested }) => {
  const navigate = useNavigate();

  const statusColors = {
    OPEN: 'badge-success',
    NEGOTIATING: 'badge-warning',
    CONFIRMED: 'badge-info',
    ACTIVE: 'badge-warning',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-danger',
  };

  const openChat = async () => {
    try {
      const res = await api.get(`/chat/room/${request._id}`);
      const chatRoomId = res.data.data?._id;
      if (chatRoomId) {
        navigate(`/community/chat/${chatRoomId}`);
      } else {
        navigate(`/community/chat/${request._id}`);
      }
    } catch {
      navigate(`/community/chat/${request._id}`);
    }
  };

  return (
    <div className="card hover:shadow-2xl transition-all transform hover:-translate-y-1">
      {request.images?.length > 0 && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img src={request.images[0].url} alt={request.itemName} className="w-full h-48 object-cover" />
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-eco-dark">{request.itemName}</h3>
          <span className="badge bg-primary-100 text-primary-700">{request.category}</span>
        </div>
        <span
          className={`badge ${statusColors[request.status]} ${request.status === 'NEGOTIATING' ? 'cursor-pointer' : ''}`}
          onClick={() => request.status === 'NEGOTIATING' && openChat()}
        >
          {request.status}
        </span>
      </div>
      {request.description && <p className="text-gray-600 text-sm mb-3">{request.description}</p>}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex gap-2">
          <MapPin size={16} />
          {request.locality}, {request.pincode}
        </div>
        {request.distance !== undefined && (
          <div className="flex gap-2 bg-blue-50 px-2 py-1 rounded text-blue-700 font-semibold">
            <Navigation size={16} />
            <span>{request.distance} km away</span>
          </div>
        )}
        <div className="flex gap-2">
          <Calendar size={16} />
          {formatDateRange(request.startDate, request.endDate)}
          ({getDaysDifference(request.startDate, request.endDate)} days)
        </div>
        <div className="flex gap-2">
          <DollarSign size={16} />
          {request.paymentType === 'Free' ? 'Free' : `₹${request.amount}`}
        </div>
        <div className="flex gap-2">
          <User size={16} />
          Requested by {request.requesterId?.name}
        </div>
      </div>
      {request.status === 'OPEN' && (
        <button onClick={() => onInterested(request._id)} className="btn-primary w-full mt-4">
          I'm Interested
        </button>
      )}
      {request.status === 'NEGOTIATING' && (
        <button onClick={openChat} className="btn-primary w-full mt-4">
          Open Chat
        </button>
      )}
    </div>
  );
};

export default RequestCard;
