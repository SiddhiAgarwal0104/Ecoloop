import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Pin, MapPin, Map } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { validateRequired, isValidPincode, isValidDateRange } from '../../utils/validators';

const CATEGORIES = [
  'Electronics',
  'Tools',
  'Sports',
  'Books',
  'Furniture',
  'Vehicles',
  'Clothing',
  'Kitchen',
  'Garden',
  'Other',
];

const RequestForm = ({ onSubmit, onCancel, loading }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    description: '',
    locality: '',
    pincode: '',
    latitude: '',
    longitude: '',
    startDate: '',
    endDate: '',
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (showMap && mapRef.current && !mapInstance.current) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            initializeMap(latitude, longitude);
          },
          () => {
            initializeMap(28.6139, 77.2090);
          }
        );
      }
    }
  }, [showMap]);

  const initializeMap = (lat, lng) => {
    if (mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(
      mapInstance.current
    );

    markerRef.current.on('dragend', async () => {
      const { lat: newLat, lng: newLng } = markerRef.current.getLatLng();
      await getReverseGeocode(newLat, newLng);
    });

    mapInstance.current.on('click', async (e) => {
      const { lat: newLat, lng: newLng } = e.latlng;
      markerRef.current.setLatLng([newLat, newLng]);
      await getReverseGeocode(newLat, newLng);
    });

    getReverseGeocode(lat, lng);
  };

  const getReverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      const address = data.address || {};
      const locality = address.suburb || address.city || address.town || '';
      const pincode = address.postcode || '';

      setFormData((prev) => ({
        ...prev,
        locality: locality,
        pincode: pincode,
        latitude: parseFloat(lat).toFixed(6),
        longitude: parseFloat(lng).toFixed(6),
      }));
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 3) {
      setErrors((prev) => ({ ...prev, images: 'Maximum 3 images allowed' }));
      return;
    }

    setImages((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setErrors((prev) => ({ ...prev, images: '' }));
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};

    // Required fields
    if (!formData.itemName.trim()) newErrors.itemName = 'Item name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.locality.trim()) newErrors.locality = 'Locality is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!isValidPincode(formData.pincode)) {
      newErrors.pincode = 'Invalid pincode format';
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    // Date validation
    if (formData.startDate && formData.endDate) {
      if (!isValidDateRange(formData.startDate, formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      const submitData = {
        ...formData,
        images: images,
      };
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Item Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Item Name *
        </label>
        <input
          type="text"
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          placeholder="e.g., Drill Machine, Bicycle"
          className={`input-field ${errors.itemName ? 'border-red-500' : ''}`}
          maxLength={100}
        />
        {errors.itemName && (
          <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Category *
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`input-field ${errors.category ? 'border-red-500' : ''}`}
        >
          <option value="">Select Category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-xs mt-1">{errors.category}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the item, its condition, and any other details..."
          className="input-field"
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Images Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Images (Optional, Max 3)
        </label>
        
        {imagePreviews.length < 3 && (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="text-gray-400 mb-2" size={32} />
            <span className="text-sm text-gray-600">Click to upload images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {errors.images && (
          <p className="text-red-500 text-xs mt-1">{errors.images}</p>
        )}
      </div>

      {/* Map Section */}
      <div>
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 text-eco-main hover:text-eco-dark font-semibold mb-3 transition-colors"
        >
          <Map size={20} />
          {showMap ? 'Hide Map' : 'Show Map to Select Location'}
        </button>

        {showMap && (
          <div className="mb-4">
            <div
              ref={mapRef}
              className="w-full h-80 rounded-xl border-2 border-eco-main mb-2"
            />
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Pin size={14} />
              Click on the map or drag the marker to select location
            </p>
          </div>
        )}
      </div>

      {/* Locality and Pincode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Locality *
          </label>
          <input
            type="text"
            name="locality"
            value={formData.locality}
            onChange={handleChange}
            placeholder="e.g., Koramangala"
            className={`input-field ${errors.locality ? 'border-red-500' : ''}`}
          />
          {errors.locality && (
            <p className="text-red-500 text-xs mt-1">{errors.locality}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pincode *
          </label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="e.g., 560034"
            className={`input-field ${errors.pincode ? 'border-red-500' : ''}`}
            maxLength={6}
          />
          {errors.pincode && (
            <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
          )}
        </div>
      </div>

      {/* Hidden Fields for Latitude/Longitude */}
      <input type="hidden" name="latitude" value={formData.latitude} />
      <input type="hidden" name="longitude" value={formData.longitude} />

      {/* Start and End Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`input-field ${errors.startDate ? 'border-red-500' : ''}`}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.startDate && (
            <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date *
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`input-field ${errors.endDate ? 'border-red-500' : ''}`}
            min={formData.startDate || new Date().toISOString().split('T')[0]}
          />
          {errors.endDate && (
            <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading ? 'Creating...' : 'Create Request'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default RequestForm;