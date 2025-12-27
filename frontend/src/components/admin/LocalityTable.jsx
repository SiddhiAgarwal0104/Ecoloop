import React from 'react';
import { MapPin, Users, TrendingUp, TrendingDown } from 'lucide-react';

const LocalityTable = ({ localities }) => {
  const getPerformanceBadge = (rate) => {
    if (rate >= 70) return { bg: 'bg-green-100', text: 'text-green-700', label: 'Excellent' };
    if (rate >= 50) return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Good' };
    if (rate >= 30) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Average' };
    return { bg: 'bg-red-100', text: 'text-red-700', label: 'Needs Attention' };
  };

  if (!localities || localities.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No localities found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-eco-light">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase tracking-wider">
              Locality
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase tracking-wider">
              Households
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase tracking-wider">
              Active Users
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase tracking-wider">
              Participation
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase tracking-wider">
              Total Waste (kg)
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {localities.map((locality) => {
            const badge = getPerformanceBadge(locality.participationRate);
            return (
              <tr key={locality._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <MapPin className="text-eco-main mr-2" size={20} />
                    <div>
                      <p className="font-semibold text-eco-dark">{locality.name}</p>
                      <p className="text-xs text-gray-500">{locality.pincode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-900">{locality.city}</p>
                  <p className="text-xs text-gray-500">{locality.state}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <p className="text-sm font-medium text-gray-900">{locality.totalHouseholds}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users size={16} className="text-gray-500" />
                    <p className="text-sm font-medium text-gray-900">{locality.activeUsers}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-bold text-eco-main">
                      {locality.participationRate.toFixed(1)}%
                    </p>
                    {locality.participationRate >= 50 ? (
                      <TrendingUp size={16} className="text-green-500" />
                    ) : (
                      <TrendingDown size={16} className="text-red-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <p className="text-sm font-semibold text-gray-900">
                    {locality.wasteStats?.totalWasteLogged?.toFixed(2) || 0}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
                  >
                    {badge.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LocalityTable;