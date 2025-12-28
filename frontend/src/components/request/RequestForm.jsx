import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    description: '',
    locality: '',
    pincode: '',
    startDate: '',
    endDate: '',
    paymentType: 'Free',
    amount: 0,
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

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

    // Amount validation for paid requests
    if (formData.paymentType === 'Paid' && formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
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

      {/* Payment Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Payment Type *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentType"
              value="Free"
              checked={formData.paymentType === 'Free'}
              onChange={handleChange}
              className="text-eco-main focus:ring-eco-main"
            />
            <span className="text-gray-700">Free</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentType"
              value="Paid"
              checked={formData.paymentType === 'Paid'}
              onChange={handleChange}
              className="text-eco-main focus:ring-eco-main"
            />
            <span className="text-gray-700">Paid</span>
          </label>
        </div>
      </div>

      {/* Amount (if Paid) */}
      {formData.paymentType === 'Paid' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Amount (₹) *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            className={`input-field ${errors.amount ? 'border-red-500' : ''}`}
            min="0"
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
          )}
        </div>
      )}

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