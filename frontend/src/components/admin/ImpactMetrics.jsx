import React from 'react';
import { Leaf, Zap, TrendingUp, Truck } from 'lucide-react';

const ImpactMetrics = ({ metrics, showGrowth = false, growth = {} }) => {
  const metricsData = [
    {
      icon: Truck,
      label: 'Total Waste Logged',
      value: metrics?.totalWaste || 0,
      unit: 'kg',
      bg: 'from-green-50 to-white',
      iconBg: 'bg-eco-main',
      growth: growth?.waste,
    },
    {
      icon: Leaf,
      label: 'CO₂ Saved',
      value: metrics?.totalCO2Saved || 0,
      unit: 'kg',
      bg: 'from-blue-50 to-white',
      iconBg: 'bg-blue-600',
    },
    {
      icon: Zap,
      label: 'Energy Saved',
      value: metrics?.totalEnergySaved || 0,
      unit: 'kWh',
      bg: 'from-yellow-50 to-white',
      iconBg: 'bg-yellow-600',
    },
    {
      icon: TrendingUp,
      label: 'Landfill Reduced',
      value: metrics?.totalLandfillReduced || 0,
      unit: 'kg',
      bg: 'from-purple-50 to-white',
      iconBg: 'bg-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className={`card bg-gradient-to-br ${metric.bg}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`${metric.iconBg} p-3 rounded-xl`}>
                <Icon className="text-white" size={24} />
              </div>
              {showGrowth && metric.growth !== undefined && (
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    metric.growth >= 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {metric.growth >= 0 ? '+' : ''}
                  {metric.growth}%
                </span>
              )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{metric.label}</h3>
            <p className="text-3xl font-bold text-eco-dark">
              {typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value} {metric.unit}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ImpactMetrics;