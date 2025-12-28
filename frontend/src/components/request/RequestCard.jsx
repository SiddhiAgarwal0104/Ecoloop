import React from 'react';
import { MapPin, Calendar, DollarSign, User } from 'lucide-react';
import { formatDateRange, getDaysDifference } from '../../utils/dateFormatter';

const RequestCard = ({ request, onInterested }) => {
  const statusColors = {
    OPEN: 'badge-success',
    NEGOTIATING: 'badge-warning',
    CONFIRMED: 'badge-info',
    ACTIVE: 'badge-warning',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-danger',
  };

  return (
    <div className="card hover:shadow-2xl transition-all transform hover:-translate-y-1">
      {/* Image */}
      {request.images && request.images.length > 0 && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img
            src={request.images[0].url}
            alt={request.itemName}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-eco-dark mb-1">
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

      {/* Description */}
      {request.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {request.description}
        </p>
      )}

      {/* Details */}
      <div className="space-y-2 mb-4">
        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} className="text-eco-main" />
          <span>{request.locality}, {request.pincode}</span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} className="text-eco-main" />
          <span>
            {formatDateRange(request.startDate, request.endDate)}
            <span className="ml-2 text-xs text-gray-500">
              ({getDaysDifference(request.startDate, request.endDate)} days)
            </span>
          </span>
        </div>

        {/* Payment */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign size={16} className="text-eco-main" />
          <span className="font-semibold">
            {request.paymentType === 'Free' ? (
              <span className="text-green-600">Free</span>
            ) : (
              <span className="text-primary-700">₹{request.amount}</span>
            )}
          </span>
        </div>

        {/* Requester */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} className="text-eco-main" />
          <span>Requested by {request.requesterId?.name}</span>
        </div>
      </div>

      {/* Action Button */}
      {request.status === 'OPEN' && onInterested && (
        <button
          onClick={() => onInterested(request._id)}
          className="btn-primary w-full"
        >
          I'm Interested
        </button>
      )}

      {request.status === 'NEGOTIATING' && (
        <button className="btn-secondary w-full" disabled>
          In Negotiation
        </button>
      )}
    </div>
  );
};

export default RequestCard;