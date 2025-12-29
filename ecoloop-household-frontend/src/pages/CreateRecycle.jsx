import { useState } from 'react';
import Layout from '../components/Layout';
import LocationPicker from '../components/LocationPicker';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';

const CreateRecycle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    wasteCategory: 'PLASTIC',
    wasteType: 'SEGREGATED',
    quantity: 1,
    unit: 'KG',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      address: location.address,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate location is selected
    if (!formData.address || !formData.latitude || !formData.longitude) {
      alert('Please select a pickup location');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      
      // Append all form fields
      data.append('wasteCategory', formData.wasteCategory);
      data.append('wasteType', formData.wasteType);
      data.append('quantity', formData.quantity);
      data.append('unit', formData.unit);
      data.append('description', formData.description);
      data.append('address', formData.address);
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);

      // Append images
      images.forEach(image => {
        data.append('images', image);
      });

      const response = await axios.post('/recycle', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('✅ Recycle request created:', response.data);
      navigate('/recycles');
    } catch (error) {
      console.error('❌ Failed to create recycle:', error);
      alert(error.response?.data?.error || 'Failed to create recycle request');
    } finally {
      setLoading(false);
    }
  };

  return (
    
      <div className="fade-in max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-eco-dark mb-2">Create Recycle Request</h1>
          <p className="text-gray-600">Help recycle waste responsibly</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Waste Category *
              </label>
              <select
                name="wasteCategory"
                value={formData.wasteCategory}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="PLASTIC">Plastic</option>
                <option value="PAPER">Paper</option>
                <option value="METAL">Metal</option>
                <option value="GLASS">Glass</option>
                <option value="E_WASTE">E-Waste</option>
                <option value="ORGANIC">Organic</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Waste Type *
              </label>
              <select
                name="wasteType"
                value={formData.wasteType}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="SEGREGATED">Segregated</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="input-field"
                min="0.1"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Unit *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="KG">Kilogram (KG)</option>
                <option value="PIECES">Pieces</option>
                <option value="ITEMS">Items</option>
                <option value="BAGS">Bags</option>
              </select>
            </div>
          </div>

          {/* Location Picker */}
          <LocationPicker 
            onLocationSelect={handleLocationSelect}
            defaultAddress={formData.address}
          />

          {/* Show selected location */}
          {formData.address && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800 mb-1">✅ Selected Location:</p>
              <p className="text-sm text-green-700">{formData.address}</p>
              <p className="text-xs text-green-600 mt-1">
                Lat: {formData.latitude}, Lng: {formData.longitude}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows={4}
              placeholder="Add details about the waste..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Images (Max 5)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <Upload className="mx-auto text-gray-400 mb-2" size={40} />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="text-eco-main font-semibold cursor-pointer hover:text-eco-dark"
              >
                Click to upload
              </label>
              <p className="text-sm text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/recycles')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Creating...' : 'Create Recycle Request'}
            </button>
          </div>
        </form>
      </div>
    
  );
};

export default CreateRecycle;