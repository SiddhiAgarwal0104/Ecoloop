import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, MapPin } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

const CompleteProfile = () => {
  const { updateProfile, user } = useAuth();
  const navigate = useNavigate();

  const isNGO = user?.role === 'NGO';

  const [formData, setFormData] = useState({
    phone: '',
    city: '',
    locality: '',
    pincode: '',
    address: '',
    latitude: null,
    longitude: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ This will be called by Map later
  const setLocation = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 🔴 NGO strict validation
    if (!formData.city.trim()) {
      setError('City is required');
      return;
    }
    if (!formData.locality.trim()) {
      setError('Locality is required');
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }
    if (isNGO && (formData.latitude === null || formData.longitude === null)) {
      setError('Please select your NGO location on the map');
      return;
    }

    setLoading(true);

    try {
      console.log('📝 [Profile] Submitting profile completion:', {
        role: user?.role,
        city: formData.city,
        locality: formData.locality
      });

      const payload = {
        phone: formData.phone,
        city: formData.city,
        locality: formData.locality,
        pincode: formData.pincode,
        address: formData.address,
      };

      // send coords only when present
      if (formData.latitude !== null && formData.longitude !== null) {
        payload.latitude = formData.latitude;
        payload.longitude = formData.longitude;
      }

      const response = await updateProfile(payload);
      
      console.log('✅ [Profile] Profile completed:', response);

      // Show success message for NGO
      if (isNGO) {
        alert('✅ Profile completed successfully!\n\nYour NGO has been submitted for verification. An admin from your city will review your profile and approve it soon.\n\nYou will be able to login and access donations once approved.');
        navigate('/login');
      } else if (user.role === 'RECYCLER') {
        navigate('/recycler/dashboard');
      } else {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl">

        {isNGO ? (
          <>
            <h1 className="text-3xl font-bold mb-2">Complete Your NGO Profile</h1>
            <p className="text-gray-600 mb-4">
              Help us verify your NGO and connect you with donors
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-700 text-sm">
                <strong>📍 Important:</strong> After profile completion, an admin from your city will review and approve your NGO. This helps us maintain quality service.
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-gray-600 mb-6">
              Location is required for pickups and matching
            </p>
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5 flex gap-2">
            <AlertCircle className="text-red-600" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-semibold">Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">City *</label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="e.g., Delhi, Mumbai"
                className="input-field"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Locality *</label>
              <input
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                required
                placeholder="e.g., Sector 28, Karol Bagh"
                className="input-field"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Pincode *</label>
              <input
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                placeholder="e.g., 110034"
                maxLength="6"
                className="input-field"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold">Address *</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
          </div>

         {/* 🗺️ OPENSTREETMAP LOCATION PICKER */}
{isNGO && (
  <div>
    <label className="text-sm font-semibold mb-2 block">
      NGO Pickup Location *
    </label>

    <LocationPicker
      onLocationSelect={(loc) => {
        setFormData((prev) => ({
          ...prev,
          address: loc.address,
          locality: loc.locality || loc.address.split(',')[0],
          latitude: loc.latitude,
          longitude: loc.longitude,
        }));
      }}
    />


    {formData.latitude && formData.longitude && (
      <p className="text-xs text-green-600 mt-2">
        📍 Location selected: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
      </p>
    )}
  </div>
)}


          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
