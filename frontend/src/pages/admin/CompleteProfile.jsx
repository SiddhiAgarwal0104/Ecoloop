import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    assignedCity: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    // Check if admin data exists in localStorage
    const storedAdminData = localStorage.getItem('adminData');
    if (!storedAdminData) {
      navigate('/admin/login');
      return;
    }
    
    const admin = JSON.parse(storedAdminData);
    setAdminData(admin);
    
    // If profile is already complete, redirect to dashboard
    if (admin.name && admin.phone && admin.assignedCity && admin.assignedCity !== 'Not Set') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Please enter a valid name (minimum 2 characters)';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    // City validation
    if (!formData.assignedCity) {
      newErrors.assignedCity = 'City is required';
    } else if (formData.assignedCity.trim().length < 2) {
      newErrors.assignedCity = 'Please enter a valid city name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = formData.phone.replace(/\s/g, '');
      
      const response = await api.put('/auth/profile', {
        name: formData.name.trim(),
        phone: cleanPhone,
        assignedCity: formData.assignedCity.trim()
      });

      if (response.data.success) {
        // Update localStorage with new admin data
        localStorage.setItem('adminData', JSON.stringify(response.data.data));
        
        setSuccessMessage('Profile completed successfully! Redirecting to dashboard...');
        
        // Redirect after 1.5 seconds
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      setGeneralError(errorMessage);
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!adminData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-eco-light">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-light to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-eco-dark mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Just 3 more fields to get started!</p>
        </div>

        {/* Profile Card */}
        <div className="card shadow-lg">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          )}

          {/* General Error Message */}
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm">{generalError}</p>
            </div>
          )}

          {/* Admin Info Display */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Welcome,</span> {adminData.name}!
            </p>
            <p className="text-xs text-blue-600 mt-1">{adminData.email}</p>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-eco-dark mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., John Doe"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-eco-main'
                }`}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-semibold text-eco-dark mb-2">
                Phone Number (10 digits) *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="1234567890"
                maxLength="10"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.phone
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-eco-main'
                }`}
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* City Field */}
            <div>
              <label className="block text-sm font-semibold text-eco-dark mb-2">
                Assigned City *
              </label>
              <input
                type="text"
                name="assignedCity"
                value={formData.assignedCity}
                onChange={handleInputChange}
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.assignedCity
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-eco-main'
                }`}
              />
              {errors.assignedCity && (
                <p className="text-red-600 text-sm mt-1">{errors.assignedCity}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-eco-main hover:bg-eco-dark text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  Updating Profile...
                </>
              ) : (
                'Complete Profile'
              )}
            </button>
          </form>

          {/* Info Message */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <span className="font-semibold">Note:</span> You can update these details later from your profile settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
