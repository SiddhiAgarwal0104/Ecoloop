import React from 'react';

const StatsCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend, 
  bgGradient = 'from-green-50 to-white',
  iconBg = 'bg-eco-main'
}) => {
  return (
    <div className={`card bg-gradient-to-br ${bgGradient}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`${iconBg} p-3 rounded-xl`}>
          <Icon className="text-white" size={24} />
        </div>
        {trend !== undefined && (
          <span
            className={`text-sm font-semibold px-3 py-1 rounded-full ${
              trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-eco-dark">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );
};

export default StatsCard;
