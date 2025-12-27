import React, { useState, useEffect } from 'react';
import { Leaf, Zap, TrendingUp, TreePine, Home, Truck } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const SustainabilityImpact = () => {
  const [impactData, setImpactData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [wasteByType, setWasteByType] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImpactData();
  }, []);

  const fetchImpactData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const [impactRes, trendsRes, typeRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/sustainability/impact`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/sustainability/trends?months=6`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/sustainability/by-waste-type`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setImpactData(impactRes.data.data);
      setTrends(trendsRes.data.data);
      setWasteByType(typeRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sustainability data:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#4caf50', '#66bb6a', '#81c784', '#a5d6a7'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">Sustainability Impact</h1>
        <p className="text-gray-600">Track environmental benefits and impact metrics</p>
      </div>

      {/* Impact Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* CO2 Saved */}
        <div className="card bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-3 rounded-xl">
              <Leaf className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">CO₂ Saved</h3>
          <p className="text-3xl font-bold text-eco-dark">
            {impactData?.metrics.totalCO2Saved.toFixed(2)} kg
          </p>
          <p className="text-xs text-gray-500 mt-2">
            ≈ {impactData?.equivalents.treesPlanted} trees planted
          </p>
        </div>

        {/* Energy Saved */}
        <div className="card bg-gradient-to-br from-yellow-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-500 p-3 rounded-xl">
              <Zap className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Energy Saved</h3>
          <p className="text-3xl font-bold text-eco-dark">
            {impactData?.metrics.totalEnergySaved.toFixed(2)} kWh
          </p>
          <p className="text-xs text-gray-500 mt-2">
            ≈ {impactData?.equivalents.homesPoweredYearly} homes/year
          </p>
        </div>

        {/* Landfill Reduced */}
        <div className="card bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 p-3 rounded-xl">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Landfill Reduced</h3>
          <p className="text-3xl font-bold text-eco-dark">
            {impactData?.metrics.totalLandfillReduced.toFixed(2)} kg
          </p>
          <p className="text-xs text-gray-500 mt-2">
            ≈ {impactData?.equivalents.trucksFilled} trucks
          </p>
        </div>

        {/* Total Waste */}
        <div className="card bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 p-3 rounded-xl">
              <Truck className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Waste Logged</h3>
          <p className="text-3xl font-bold text-eco-dark">
            {impactData?.metrics.totalWasteLogged.toFixed(2)} kg
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {impactData?.metrics.totalLogs} logs
          </p>
        </div>
      </div>

      {/* Environmental Equivalents */}
      <div className="card mb-8 bg-gradient-to-r from-green-50 to-blue-50">
        <h2 className="text-xl font-bold text-eco-dark mb-6 flex items-center gap-2">
          <TreePine className="text-eco-main" size={24} />
          Environmental Impact Equivalents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-white rounded-xl">
            <TreePine size={40} className="mx-auto text-green-500 mb-3" />
            <p className="text-3xl font-bold text-eco-dark mb-2">
              {impactData?.equivalents.treesPlanted}
            </p>
            <p className="text-sm text-gray-600">Trees Planted Equivalent</p>
            <p className="text-xs text-gray-500 mt-1">Based on CO₂ absorption</p>
          </div>

          <div className="text-center p-4 bg-white rounded-xl">
            <Home size={40} className="mx-auto text-yellow-500 mb-3" />
            <p className="text-3xl font-bold text-eco-dark mb-2">
              {impactData?.equivalents.homesPoweredYearly}
            </p>
            <p className="text-sm text-gray-600">Homes Powered (Yearly)</p>
            <p className="text-xs text-gray-500 mt-1">Based on energy saved</p>
          </div>

          <div className="text-center p-4 bg-white rounded-xl">
            <Truck size={40} className="mx-auto text-blue-500 mb-3" />
            <p className="text-3xl font-bold text-eco-dark mb-2">
              {impactData?.equivalents.trucksFilled}
            </p>
            <p className="text-sm text-gray-600">Garbage Trucks Filled</p>
            <p className="text-xs text-gray-500 mt-1">Based on landfill reduction</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Impact Trends */}
        <div className="card">
          <h2 className="text-xl font-bold text-eco-dark mb-6">Impact Trends (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="co2Saved" stroke="#4caf50" name="CO₂ Saved (kg)" strokeWidth={2} />
              <Line type="monotone" dataKey="energySaved" stroke="#ffc107" name="Energy Saved (kWh)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Waste by Type */}
        <div className="card">
          <h2 className="text-xl font-bold text-eco-dark mb-6">Waste Distribution by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={wasteByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ wasteType, totalWaste }) => `${wasteType}: ${totalWaste.toFixed(0)} kg`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="totalWaste"
              >
                {wasteByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Waste Type Details */}
      <div className="card">
        <h2 className="text-xl font-bold text-eco-dark mb-6">Impact by Waste Type</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-eco-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-eco-dark uppercase">
                  Waste Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
                  Total Weight (kg)
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
                  CO₂ Saved (kg)
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
                  Energy Saved (kWh)
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-eco-dark uppercase">
                  Landfill Reduced (kg)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wasteByType.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-eco-dark capitalize">{item.wasteType}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-medium">{item.totalWaste.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center font-medium text-green-600">{item.co2Saved.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center font-medium text-yellow-600">{item.energySaved.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center font-medium text-blue-600">{item.landfillReduced.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityImpact;