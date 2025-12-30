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
    locality: '',
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
   if (!formData.locality.trim()) {
  setError('Locality is required');
  return;
}


    setLoading(true);

    try {
      const payload = {
        phone: formData.phone,
        locality: formData.locality,
        address: formData.address,
      };

      // send coords only when present
      if (formData.latitude !== null && formData.longitude !== null) {
        payload.latitude = formData.latitude;
        payload.longitude = formData.longitude;
      }

      await updateProfile(payload);

      // 🚀 role based redirect
      if (isNGO) navigate('/ngo/dashboard');
      else if (user.role === 'RECYCLER') navigate('/recycler/dashboard');
      else navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.error || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl">

        <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
        <p className="text-gray-600 mb-6">
          Location is required for pickups and matching
        </p>

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
              <label className="text-sm font-semibold">Locality *</label>
              <input
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                required
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
      locality: loc.locality || loc.address.split(',')[0], // ✅ ADD THIS LINE
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
