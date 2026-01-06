import React from 'react';
import { MapPin, Calendar, DollarSign, User, Clock } from 'lucide-react';
import { formatDate, formatDateRange, getDaysDifference } from '../../utils/dateFormatter';

const RequestDetails = ({ request }) => {
  const statusColors = {
    OPEN: 'bg-green-100 text-green-700',
    NEGOTIATING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    ACTIVE: 'bg-orange-100 text-orange-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      {/* Images */}
      {request.images && request.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {request.images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={`${request.itemName} ${index + 1}`}
              className="w-full h-48 object-cover rounded-xl"
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-eco-dark mb-2">
              {request.itemName}
            </h2>
            <div className="flex items-center gap-3">
              <span className="badge bg-primary-100 text-primary-700">
                {request.category}
              </span>
              <span className={`badge ${statusColors[request.status]}`}>
                {request.status}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {request.description && (
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{request.description}</p>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Location */}
        <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-eco-main p-2 rounded-lg">
              <MapPin className="text-white" size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Location</h3>
          </div>
          <p className="text-gray-900 font-medium">{request.locality}</p>
          <p className="text-gray-600 text-sm">Pincode: {request.pincode}</p>
        </div>

        {/* Duration */}
        <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Calendar className="text-white" size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Duration</h3>
          </div>
          <p className="text-gray-900 font-medium">
            {formatDateRange(request.startDate, request.endDate)}
          </p>
          <p className="text-gray-600 text-sm">
            {getDaysDifference(request.startDate, request.endDate)} days
          </p>
        </div>

        {/* Payment */}
        <div className="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <DollarSign className="text-white" size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Payment</h3>
          </div>
          <p className="text-gray-900 font-medium">
            {request.paymentType === 'Free' ? (
              <span className="text-green-600">Free</span>
            ) : (
              <span className="text-primary-700">₹{request.amount}</span>
            )}
          </p>
          <p className="text-gray-600 text-sm">{request.paymentType}</p>
        </div>

        {/* Requester */}
        <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-500 p-2 rounded-lg">
              <User className="text-white" size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Requested By</h3>
          </div>
          <p className="text-gray-900 font-medium">{request.requesterId?.name}</p>
          <p className="text-gray-600 text-sm">{request.requesterId?.email}</p>
        </div>
      </div>

      {/* Timeline */}
      {(request.handedOverAt || request.returnedAt) && (
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} className="text-eco-main" />
              <span>Created: {formatDate(request.createdAt, 'PPp')}</span>
            </div>
            {request.handedOverAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-eco-main" />
                <span>Handed Over: {formatDate(request.handedOverAt, 'PPp')}</span>
              </div>
            )}
            {request.returnedAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-eco-main" />
                <span>Returned: {formatDate(request.returnedAt, 'PPp')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Accepted By (if confirmed) */}
      {request.acceptedBy && (
        <div className="bg-green-50 p-4 rounded-xl border-l-4 border-eco-main">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Lender</h3>
          <p className="text-gray-900 font-medium">{request.acceptedBy?.name}</p>
          <p className="text-gray-600 text-sm">{request.acceptedBy?.email}</p>
        </div>
      )}
    </div>
  );
};

export default RequestDetails;