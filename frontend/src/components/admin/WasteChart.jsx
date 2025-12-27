import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const WasteChart = ({ type = 'line', data, title }) => {
  const COLORS = ['#4caf50', '#66bb6a', '#81c784', '#a5d6a7'];

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="co2Saved"
                stroke="#4caf50"
                name="CO₂ Saved (kg)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="energySaved"
                stroke="#ffc107"
                name="Energy Saved (kWh)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="waste" fill="#4caf50" name="Waste (kg)" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ wasteType, totalWaste }) =>
                  `${wasteType}: ${totalWaste?.toFixed(0) || 0} kg`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="totalWaste"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <p className="text-gray-500">Invalid chart type</p>;
    }
  };

  return (
    <div className="card">
      {title && <h2 className="text-xl font-bold text-eco-dark mb-6">{title}</h2>}
      {renderChart()}
    </div>
  );
};

export default WasteChart;