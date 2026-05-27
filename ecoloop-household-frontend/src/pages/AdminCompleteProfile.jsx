import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Phone, MapPin, AlertCircle, CheckCircle, Home } from 'lucide-react';
import axios from 'axios';

const AdminCompleteProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: '',
    city: '',
    locality: '',
    pincode: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const adminToken = localStorage.getItem('adminToken');
  const userName = localStorage.getItem('userName');

  // Redirect if not logged in
  if (!adminToken) {
    navigate('/admin/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!formData.city.trim()) {
      setError('City is required');
      return;
    }
    if (!formData.locality.trim()) {
      setError('Locality is required');
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/profile/complete`,
        {
          phone: formData.phone || null,
          city: formData.city,
          locality: formData.locality,
          pincode: formData.pincode,
          address: formData.address,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage('✅ Profile completed successfully!');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow skipping to dashboard
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4 relative">
      {/* Back to Landing Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-blue-600 hover:text-blue-700 font-medium"
      >
        <Home size={20} />
        <span>Back Home</span>
      </button>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-lg">
              <Leaf className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {userName}!</h1>
              <p className="text-gray-600 text-sm">Complete your admin profile</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          {/* Progress Bar */}
          <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>

          <div className="p-8 sm:p-10">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                <p className="text-green-700 font-medium">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Help us understand your location for better admin operations
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g., +91 98765 43210"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g., Delhi, Mumbai, Bangalore"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>

                {/* Locality */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Locality / Area *
                  </label>
                  <input
                    type="text"
                    name="locality"
                    value={formData.locality}
                    onChange={handleChange}
                    placeholder="e.g., Sector 28, Karol Bagh"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g., 110034"
                    maxLength="6"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your complete address"
                    rows="3"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">ℹ️ Note:</span> This information helps us better manage admin operations and contact you when needed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving Profile...' : 'Complete Profile'}
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={loading}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Skip for Now
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>You can update your profile anytime from the admin settings</p>
        </div>
      </div>
    </div>
  );
};

export default AdminCompleteProfile;
