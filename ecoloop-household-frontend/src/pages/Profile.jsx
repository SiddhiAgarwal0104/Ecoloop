import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Edit2, Save, X, User, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LocationPicker from '../components/LocationPicker';

/**
 * Profile Page Component
 * View and edit user profile for all roles
 */
const Profile = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  console.log('📄 Profile component mounted');
  console.log('   User:', user);
  console.log('   User role:', user?.role);
  console.log('   isEditing:', isEditing);

  const isRecycler = user?.role === 'RECYCLER';
  const isNGO = user?.role === 'NGO';
  const isHousehold = user?.role === 'HOUSEHOLD';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    locality: '',
    pincode: '',
    address: '',
    bio: '',
    latitude: null,
    longitude: null,
  });

  // Sync form data with user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || '',
        locality: user.locality || '',
        pincode: user.pincode || '',
        address: user.address || '',
        bio: user.bio || '',
        latitude: user.latitude || null,
        longitude: user.longitude || null,
      });
    }
  }, [user]);

  // Refresh user data on mount
  useEffect(() => {
    if (refreshUser) {
      refreshUser();
    }
  }, [refreshUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      address: location.address,
      locality: location.locality || location.address.split(',')[0]?.trim(),
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Build payload
      const payload = {
        phone: formData.phone?.trim() || '',
        city: formData.city?.trim() || '',
        locality: formData.locality?.trim() || '',
        pincode: formData.pincode?.trim() || '',
        address: formData.address?.trim() || '',
      };

      // Include coordinates if available
      if (formData.latitude !== null && formData.longitude !== null) {
        payload.latitude = formData.latitude;
        payload.longitude = formData.longitude;
      }

      // Validation
      if (!payload.city) {
        setError('City is required');
        setLoading(false);
        return;
      }
      if (!payload.locality) {
        setError('Locality is required');
        setLoading(false);
        return;
      }
      if (isHousehold && !payload.pincode) {
        setError('Pincode is required for households');
        setLoading(false);
        return;
      }
      if (!payload.address) {
        setError('Address is required');
        setLoading(false);
        return;
      }

      console.log('📝 Updating profile:', payload);

      await updateProfile(payload);
      await refreshUser();
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('❌ Update error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update profile';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      city: user?.city || '',
      locality: user?.locality || '',
      pincode: user?.pincode || '',
      address: user?.address || '',
      bio: user?.bio || '',
      latitude: user?.latitude || null,
      longitude: user?.longitude || null,
    });
    setError('');
    setSuccess('');
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-eco-light border-t-eco-main"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            {isRecycler && 'Manage your recycler profile'}
            {isNGO && 'Manage your NGO profile'}
            {isHousehold && 'Manage your account information'}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-eco-main text-white rounded-lg hover:bg-eco-dark transition-colors"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600 font-medium">✅ {success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">❌ {error}</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-eco-main to-eco-dark flex items-center justify-center text-white text-3xl font-bold">
            {user.name?.charAt(0)?.toUpperCase() || '👤'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.name || 'Complete your profile'}
            </h2>
            <p className="text-gray-600">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-eco-light text-eco-dark rounded-full text-sm font-medium">
              {user.role}
            </span>
          </div>
        </div>

        {/* Profile Fields */}
        {isEditing ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6" noValidate>
            {/* Name - Read Only */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Name cannot be changed</p>
            </div>

            {/* Email - Read Only */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone size={16} />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
              />
            </div>

            {/* City & Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Home size={16} />
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., Delhi, Mumbai"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pincode {isHousehold && '*'}
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g., 110034"
                  maxLength="6"
                  required={isHousehold}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Locality */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin size={16} />
                Locality / Area *
              </label>
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                placeholder="e.g., Karol Bagh, Sector 28"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                required
                placeholder="Enter your complete address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition resize-none"
              />
            </div>

            {/* Location Picker - Map Feature */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Select Your Location on Map *
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Click on the map to select your exact location. This helps us match you with nearby services.
              </p>
              
              <LocationPicker onLocationSelect={handleLocationSelect} />

              {formData.latitude && formData.longitude && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-700 font-medium">
                    ✅ Location selected: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Address: {formData.address}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-eco-main text-white py-3 rounded-lg hover:bg-eco-dark disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Display Mode */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Full Name</p>
              <p className="text-lg font-semibold text-gray-800">{user.name}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Email Address</p>
              <p className="text-lg font-semibold text-gray-800">{user.email}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Phone Number</p>
              <p className="text-lg font-semibold text-gray-800">{user.phone || 'Not provided'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">City</p>
                <p className="text-lg font-semibold text-gray-800">{user.city || 'Not provided'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Pincode</p>
                <p className="text-lg font-semibold text-gray-800">{user.pincode || 'Not provided'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Locality</p>
              <p className="text-lg font-semibold text-gray-800">{user.locality || 'Not provided'}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Address</p>
              <p className="text-lg font-semibold text-gray-800">{user.address || 'Not provided'}</p>
            </div>

            {/* Location Coordinates */}
            {(user.latitude || user.longitude) && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 mb-2">📍 Location Coordinates</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-600">Latitude</p>
                    <p className="text-sm font-mono text-blue-900">{user.latitude?.toFixed(6) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Longitude</p>
                    <p className="text-sm font-mono text-blue-900">{user.longitude?.toFixed(6) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Info for NGOs */}
      {isNGO && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">NGO Verification Status</h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              user.isVerified 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {user.isVerified ? '✅ Verified' : '⏳ Pending Verification'}
            </span>
            {!user.isVerified && (
              <p className="text-sm text-blue-700">
                Your NGO is awaiting admin approval from your city
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;