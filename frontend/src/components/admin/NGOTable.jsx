import React from 'react';
import { Star, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';

const NGOTable = ({ ngos }) => {
  const getRatingStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ));
  };

  const getStatusBadge = (isActive, isVerified) => {
    if (!isActive) {
      return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive', icon: AlertCircle };
    }
    if (!isVerified) {
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: AlertCircle };
    }
    return { bg: 'bg-green-100', text: 'text-green-700', label: 'Verified', icon: CheckCircle };
  };

  if (!ngos || ngos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No NGOs found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-eco-light">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase">
              NGO Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase">
              Contact
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
              Rating
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
              Collections
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
              Waste Collected
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {ngos.map((ngo) => {
            const badge = getStatusBadge(ngo.isActive, ngo.isVerified);
            const Icon = badge.icon;
            return (
              <tr key={ngo._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-eco-dark">{ngo.name}</p>
                    <p className="text-xs text-gray-500">
                      {ngo.address.city}, {ngo.address.state}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-gray-700">{ngo.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-gray-700">{ngo.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center">
                    <div className="flex gap-1 mb-1">{getRatingStars(Math.round(ngo.rating))}</div>
                    <span className="text-sm font-semibold text-gray-700">
                      {ngo.rating.toFixed(1)} / 5.0
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-sm font-semibold text-gray-900">
                    {ngo.performanceMetrics.totalCollections}
                  </p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-sm font-semibold text-eco-main">
                    {ngo.performanceMetrics.totalWasteCollected.toFixed(2)} kg
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.bg} ${badge.text}`}
                    >
                      <Icon size={14} />
                      {badge.label}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default NGOTable;