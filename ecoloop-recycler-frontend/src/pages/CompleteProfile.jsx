import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mail, Phone, MapPin, Save, Loader } from 'lucide-react';
import { useAuth, useRecyclerLocation } from '../hooks';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Profile Page Component
 * Allows recycler to view and edit their profile with map location picker
 * This is the main profile management page
 */
const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { latitude, longitude, error: locationError, getLocation } = useRecyclerLocation();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    address: user?.address || '',
    latitude: user?.latitude || latitude || null,
    longitude: user?.longitude || longitude || null,
    profileImage: null
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Update formData when user data changes (for editing existing profile)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        bio: user.bio || prev.bio,
        address: user.address || prev.address,
        latitude: user.latitude || prev.latitude,
        longitude: user.longitude || prev.longitude
      }));
      setImagePreview(user.profileImage || null);
    }
  }, [user]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    try {
      // Default location (New Delhi, India)
      const defaultLat = latitude || 28.7041;
      const defaultLng = longitude || 77.1025;

      // Create map
      const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 12);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Add marker
      const marker = L.marker([defaultLat, defaultLng], {
        draggable: true,
        icon: L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          shadowSize: [41, 41],
          iconAnchor: [12, 41],
          shadowAnchor: [12, 41],
          popupAnchor: [1, -34]
        })
      }).addTo(map);

      // Update coordinates when marker is dragged
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setFormData(prev => ({
          ...prev,
          latitude: pos.lat.toFixed(5),
          longitude: pos.lng.toFixed(5)
        }));
      });

      // Update marker when map is clicked
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        setFormData(prev => ({
          ...prev,
          latitude: e.latlng.lat.toFixed(5),
          longitude: e.latlng.lng.toFixed(5)
        }));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapLoaded(true);

      // Set initial coordinates
      if (latitude && longitude) {
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(5),
          longitude: longitude.toFixed(5)
        }));
      }

      return () => {
        map.remove();
      };
    } catch (err) {
      console.error('Map initialization error:', err);
    }
  }, []);

  // Update marker position when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && formData.latitude && formData.longitude) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.flyTo([lat, lng], 15);
      }
    }
  }, [formData.latitude, formData.longitude]);

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Search for address suggestions when typing address
    if (name === 'address' && value.length > 2) {
      searchAddress(value);
    } else if (name === 'address' && value.length <= 2) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  /**
   * Search for address using Nominatim API
   */
  const searchAddress = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const results = await response.json();
      
      if (results.length > 0) {
        // Limit to top 5 results
        setAddressSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
      }
    } catch (err) {
      console.error('Error searching address:', err);
      setAddressSuggestions([]);
    }
  };

  /**
   * Handle address suggestion selection
   */
  const handleSelectAddress = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    setFormData(prev => ({
      ...prev,
      address: suggestion.display_name,
      latitude: lat.toFixed(5),
      longitude: lng.toFixed(5)
    }));

    setShowSuggestions(false);
    setAddressSuggestions([]);

    // Update marker and map
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.flyTo([lat, lng], 15);
    }
  };

  /**
   * Handle image selection
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Form submission - Current formData:', {
      latitude: formData.latitude,
      longitude: formData.longitude,
      latType: typeof formData.latitude,
      lngType: typeof formData.longitude
    });
    
    // Validate location is selected
    if (!formData.latitude || !formData.longitude) {
      alert('📍 Please click on the map or search an address to set your location');
      return;
    }
    
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    console.log('📝 Parsed coordinates:', { lat, lng, latIsNaN: isNaN(lat), lngIsNaN: isNaN(lng) });
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('⚠️ Invalid location coordinates. Please select a valid location on the map.');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('latitude', lat);
      formDataToSend.append('longitude', lng);
      
      console.log('📤 Sending to backend - latitude:', lat, 'longitude:', lng);
      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage);
      }

      await updateUser(formDataToSend);
      console.log('✅ Profile update completed');
      alert('✅ Profile updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Failed to update profile:', err);
      alert(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600 mb-8">Manage your recycler profile and location</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Profile Picture</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="text-gray-400" size={32} />
                    )}
                  </div>

                  <div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <span className="px-4 py-2 bg-eco-main text-white rounded-lg hover:bg-eco-dark transition-colors inline-block">
                        Upload Image
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit phone number"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself and your recycling experience"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Your residential address"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                  />

                  {/* Address Suggestions Dropdown */}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectAddress(suggestion)}
                          className="w-full text-left px-4 py-2 hover:bg-eco-light hover:text-eco-main transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <p className="text-sm font-medium text-gray-900">{suggestion.display_name.split(',')[0]}</p>
                          <p className="text-xs text-gray-500">{suggestion.display_name.substring(suggestion.display_name.indexOf(',') + 1).trim().substring(0, 50)}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    step="0.00001"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="0.00000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    step="0.00001"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="0.00000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-main focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {locationError && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-600 text-sm">⚠️ {locationError}</p>
                  <p className="text-xs text-yellow-600 mt-1">Use the map to set your location</p>
                </div>
              )}
              
              {(!formData.latitude || !formData.longitude) && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-600 text-sm">📍 Click on the map or search an address to set your location</p>
                </div>
              )}
            </div>

            {/* Right Column - Map */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Map
              </label>
              <div className="relative">
                {!mapLoaded && (
                  <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
                    <Loader className="animate-spin text-eco-main" size={32} />
                  </div>
                )}
                <div
                  ref={mapRef}
                  className="w-full h-96 rounded-lg border border-gray-300 overflow-hidden"
                />
                <p className="text-xs text-gray-500 mt-2">
                  📍 Click on the map to set location or drag the marker
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-eco-main hover:bg-eco-dark disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
