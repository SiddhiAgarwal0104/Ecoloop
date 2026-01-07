import { useState } from 'react';
import Layout from '../components/Layout';
import LocationPicker from '../components/LocationPicker';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';

const CreateDonation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemCategory: 'CLOTHES',
    condition: 'GOOD',
    quantity: 1,
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

  // Handle location selection from LocationPicker
  const handleLocationSelect = (location) => {
    console.log('📍 Location selected:', location);
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

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Only JPEG, PNG, GIF, and WEBP images are allowed');
      return;
    }

    // Validate file sizes (5MB max)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      alert('Each image must be less than 5MB');
      return;
    }

    console.log('📸 Adding images:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    setImages([...images, ...files]);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (index) => {
    console.log('🗑️ Removing image at index:', index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.address || !formData.latitude || !formData.longitude) {
      alert('Please select a pickup location on the map');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      
      // Match the backend expected format
      data.append('category', formData.itemCategory);
      data.append('condition', formData.condition);
      data.append('quantity', formData.quantity);
      data.append('description', formData.description);
      
      // Send location as a JSON string
      data.append('location', JSON.stringify({
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      }));
      
      // Append images
      console.log('📤 Sending images:', images.length);
      images.forEach((image, index) => {
        console.log(`Image ${index + 1}:`, {
          name: image.name,
          size: image.size,
          type: image.type
        });
        data.append('images', image);
      });

      // Log FormData contents
      console.log('📦 FormData contents:');
      for (let pair of data.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      const response = await axios.post('/donations', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('✅ Response:', response.data);
      
      // Clean up object URLs
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      
      alert('Donation created successfully!');
      navigate('/donations');
    } catch (error) {
      console.error('❌ Failed to create donation:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message
        || 'Failed to create donation';
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="fade-in max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-700 mb-2">Create New Donation</h1>
          <p className="text-gray-600">Share your items with those in need</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Item Category *
              </label>
              <select
                name="itemCategory"
                value={formData.itemCategory}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="CLOTHES">Clothes</option>
                <option value="FOOD">Food</option>
                <option value="BOOKS">Books</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="FURNITURE">Furniture</option>
                <option value="TOYS">Toys</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="NEW">New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="USED">Used</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="input-field"
                min="1"
                required
              />
            </div>
          </div>

          {/* OpenStreetMap Location Picker */}
          <LocationPicker 
            onLocationSelect={handleLocationSelect}
            defaultAddress={formData.address}
          />

          {formData.address && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                <strong>Selected Location:</strong> {formData.address}
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
              placeholder="Add details about the items..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Images (Max 5)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
              <Upload className="mx-auto text-gray-400 mb-2" size={40} />
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="text-green-600 font-semibold cursor-pointer hover:text-green-700"
              >
                Click to upload
              </label>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, WEBP up to 5MB each
              </p>
              {images.length > 0 && (
                <p className="text-sm text-green-600 mt-2 font-semibold">
                  {images.length} image{images.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/donations')}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Donation'
              )}
            </button>
          </div>
        </form>
      </div>
  );
};

export default CreateDonation;