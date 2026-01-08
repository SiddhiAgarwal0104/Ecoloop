import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, MapPin, Phone, Home } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

/**
 * Complete Profile Page Component
 * Handles profile completion for all roles: HOUSEHOLD, NGO, RECYCLER
 */
const CompleteProfile = () => {
  const { updateProfile, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isNGO = user?.role === 'NGO';
  const isRecycler = user?.role === 'RECYCLER';
  const isHousehold = user?.role === 'HOUSEHOLD';

  // Only redirect household users if profile is completed
  useEffect(() => {
    if (authLoading) return;
    
    if (isHousehold && user?.profileCompleted) {
      console.log('🏠 Household user with completed profile - redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isHousehold, authLoading, user?.profileCompleted, navigate]);

  // Show loading while auth is loading
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-eco-dark to-eco-main">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-eco-light"></div>
      </div>
    );
  }

  // Prevent non-NGO/RECYCLER/HOUSEHOLD from seeing this page
  if (!isNGO && !isRecycler && !isHousehold) {
    return null;
  }

  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    city: user?.city || '',
    locality: user?.locality || '',
    pincode: user?.pincode || '',
    address: user?.address || '',
    latitude: null,
    longitude: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
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

  const validateForm = () => {
    if (!formData.city?.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.locality?.trim()) {
      setError('Locality is required');
      return false;
    }
    if (!formData.address?.trim()) {
      setError('Address is required');
      return false;
    }
    
    // NGO requires location
    if (isNGO && (formData.latitude === null || formData.longitude === null)) {
      setError('Please select your NGO location on the map');
      return false;
    }

    // Household requires pincode
    if (isHousehold && !formData.pincode?.trim()) {
      setError('Pincode is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('📝 [Profile] Submitting profile completion:', {
        role: user?.role,
        city: formData.city,
        locality: formData.locality,
        hasLocation: formData.latitude !== null
      });

      const payload = {
        phone: formData.phone,
        city: formData.city,
        locality: formData.locality,
        pincode: formData.pincode,
        address: formData.address,
      };

      // Include coordinates if available
      if (formData.latitude !== null && formData.longitude !== null) {
        payload.latitude = formData.latitude;
        payload.longitude = formData.longitude;
      }

      const response = await updateProfile(payload);
      
      console.log('✅ [Profile] Profile completed:', response);

      // ✅ ROLE-BASED NAVIGATION
      if (isNGO) {
        alert('✅ Profile completed successfully!\n\nYour NGO has been submitted for verification. An admin from your city will review your profile and approve it soon.\n\nYou will receive an email once approved and can then login to access donations.');
        navigate('/login');
      } else if (isRecycler) {
        // ✅ SAME FLOW AS NGO - VERIFICATION REQUIRED
        alert('✅ Profile completed successfully!\n\nYour recycler profile has been submitted for verification. An admin from your city (' + formData.city + ') will review your profile and approve it within 24-48 hours.\n\nYou will receive an email once verified and can then login to access your dashboard.');
        navigate('/login');
      } else {
        // Household - direct access
        navigate('/dashboard');
      }

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Profile update failed';
      console.error('❌ [Profile] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-eco-dark to-eco-main p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-eco-main rounded-full flex items-center justify-center mx-auto mb-4">
            {isNGO ? '❤️' : isRecycler ? '♻️' : '🏠'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isNGO ? 'Complete Your NGO Profile' : isRecycler ? 'Complete Your Recycler Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-gray-600">
            {isNGO 
              ? 'Help us verify your NGO and connect you with donors'
              : isRecycler
              ? 'Set up your recycling service area for admin verification'
              : 'We need your location to match you with nearby services'
            }
          </p>
        </div>

        {/* NGO/Recycler Verification Info */}
        {(isNGO || isRecycler) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>📍 Important:</strong> After profile completion, an admin from your city will review and approve your {isNGO ? 'NGO' : 'recycler profile'}. This helps us maintain quality service. You'll receive an email once approved.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone & City */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="inline mr-1" size={16} />
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Home className="inline mr-1" size={16} />
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="e.g., Delhi, Mumbai"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Locality & Pincode */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Locality / Area *
              </label>
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                required
                placeholder="e.g., Sector 28, Karol Bagh"
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
                required={isHousehold}
                placeholder="e.g., 110034"
                maxLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="inline mr-1" size={16} />
              Full Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter your complete address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
            />
          </div>

          {/* Location Picker - For NGOs */}
          {isNGO && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 NGO Pickup Location *
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Click on the map to select your NGO's location for pickups
              </p>
              
              <LocationPicker onLocationSelect={handleLocationSelect} />

              {formData.latitude && formData.longitude && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-700 font-medium">
                    ✅ Location selected: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Location Picker - Optional for Households & Recyclers */}
          {(isHousehold || isRecycler) && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Your Location {isRecycler ? '(Optional)' : '(Optional)'}
              </label>
              <p className="text-xs text-gray-600 mb-3">
                {isRecycler 
                  ? 'Setting your location helps us match you with nearby requests'
                  : 'Setting your location helps us match you with nearby services'
                }
              </p>
              
              <LocationPicker onLocationSelect={handleLocationSelect} />

              {formData.latitude && formData.longitude && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-700 font-medium">
                    ✅ Location selected: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-eco-main hover:bg-eco-dark disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Saving Profile...' : 'Complete Profile'}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          {isNGO || isRecycler
            ? '* Your profile will be reviewed by city admin before approval'
            : '* All information can be updated later from your profile settings'
          }
        </p>
      </div>
    </div>
  );
};

export default CompleteProfile;