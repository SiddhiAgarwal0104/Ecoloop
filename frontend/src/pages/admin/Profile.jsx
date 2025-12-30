import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Mail, Phone, MapPin, User as UserIcon } from 'lucide-react';
import api from '../../services/api';

const Profile = () => {
  const navigate = useNavigate();
  
  // Safely parse adminData from localStorage
  let initialAdminData = {};
  try {
    const stored = localStorage.getItem('adminData');
    if (stored && stored !== 'undefined') {
      initialAdminData = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error parsing adminData:', error);
  }
  
  const [adminData, setAdminData] = useState(initialAdminData);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: adminData.name || '',
    email: adminData.email || '',
    phone: adminData.phone || '',
    assignedCity: adminData.assignedCity || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (formData.name && formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    if (formData.assignedCity && formData.assignedCity.trim().length < 2) {
      newErrors.assignedCity = 'City name must be at least 2 characters';
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
        const updatedData = response.data.data;
        if (updatedData) {
          localStorage.setItem('adminData', JSON.stringify(updatedData));
          setAdminData(updatedData);
        }
        
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      setGeneralError(errorMessage);
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-eco-main hover:text-eco-dark mb-4 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-3xl font-bold text-eco-dark">My Profile</h1>
        <p className="text-gray-600 mt-2">View and manage your account information</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {generalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {generalError}
        </div>
      )}

      {/* Profile Card */}
      <div className="card shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-eco-dark">Account Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-eco-main hover:bg-eco-dark text-white rounded-lg transition"
          >
            <Edit2 size={18} />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {!isEditing ? (
          // View Mode
          <div className="space-y-6">
            {/* Name */}
            <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
              <div className="bg-eco-light p-3 rounded-lg">
                <UserIcon className="text-eco-main" size={24} />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 font-semibold">Full Name</label>
                <p className="text-lg text-eco-dark font-medium">{adminData.name || 'Not set'}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
              <div className="bg-eco-light p-3 rounded-lg">
                <Mail className="text-eco-main" size={24} />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 font-semibold">Email Address</label>
                <p className="text-lg text-eco-dark font-medium">{adminData.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
              <div className="bg-eco-light p-3 rounded-lg">
                <Phone className="text-eco-main" size={24} />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 font-semibold">Phone Number</label>
                <p className="text-lg text-eco-dark font-medium">{adminData.phone || 'Not set'}</p>
              </div>
            </div>

            {/* City */}
            <div className="flex items-start gap-4">
              <div className="bg-eco-light p-3 rounded-lg">
                <MapPin className="text-eco-main" size={24} />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 font-semibold">Assigned City</label>
                <p className="text-lg text-eco-dark font-medium">{adminData.assignedCity || 'Not set'}</p>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
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
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-eco-main'
                }`}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-eco-dark mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone Field */}
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
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
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

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-eco-main hover:bg-eco-dark text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
