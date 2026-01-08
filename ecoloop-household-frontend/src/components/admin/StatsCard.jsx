import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change = null, 
  color = 'eco-main',
  className = '' 
}) => {
  return (
    <div className={`card bg-gradient-to-br from-green-50 to-white ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-eco-main p-3 rounded-xl`}>
          {Icon && <Icon className="text-white" size={24} />}
        </div>
        {change && (
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
            <TrendingUp size={16} />
            {change}%
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-eco-dark">{value}</p>
      {change && <p className="text-xs text-gray-500 mt-2">vs last month</p>}
    </div>
  );
};

export default StatsCard;
