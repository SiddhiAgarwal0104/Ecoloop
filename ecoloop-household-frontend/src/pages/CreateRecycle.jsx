import { useState, useRef } from 'react';
import LocationPicker from '../components/LocationPicker';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle, Loader, Zap, Leaf, Sparkles } from 'lucide-react';

const CreateRecycle = () => {
  console.log('📄 CreateRecycle component mounted');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detectingImage, setDetectingImage] = useState(null); // Track which image is being detected
  const imageDetectionTimers = useRef({}); // Store timers for detection simulation
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
  const [imageDetections, setImageDetections] = useState({}); // Store detection for each image
  const [imageIds, setImageIds] = useState([]); // Stable IDs for images
  const [aiDetection, setAiDetection] = useState(null); // Final result from form submission

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
    
    const newImages = [];
    const newPreviews = [];
    const newIds = [];
    
    files.forEach((file, index) => {
      newImages.push(file);
      const preview = URL.createObjectURL(file);
      newPreviews.push(preview);
      
      // Create unique ID for this image
      const imageId = Date.now() + index;
      newIds.push(imageId);
      
      // Simulate AI detection for this image
      simulateAiDetection(imageId);
    });
    
    setImages([...images, ...newImages]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setImageIds([...imageIds, ...newIds]);
  };

  // Simulate AI detection with a loading state and then result
  const simulateAiDetection = (imageId) => {
    // Start loading
    setDetectingImage(imageId);
    
    // Clear any existing timer for this image
    if (imageDetectionTimers.current[imageId]) {
      clearTimeout(imageDetectionTimers.current[imageId]);
    }
    
    // Simulate 2-3 second detection time
    imageDetectionTimers.current[imageId] = setTimeout(() => {
      // Mock detection result (in real scenario, this would be from backend)
      const mockDetections = [
        {
          wasteType: 'PLASTIC',
          confidence: 0.85,
          recyclable: true,
          tips: [
            '♻️ Rinse the plastic before recycling',
            '🏷️ Remove labels and caps',
            '📦 Flatten to save space',
            '✅ Highly recyclable item'
          ]
        },
        {
          wasteType: 'PAPER',
          confidence: 0.78,
          recyclable: true,
          tips: [
            '📄 Keep dry and clean',
            '✂️ Flatten to save space',
            '🏷️ Remove plastic windows',
            '🔐 Good for recycling'
          ]
        },
        {
          wasteType: 'METAL',
          confidence: 0.90,
          recyclable: true,
          tips: [
            '💪 Crush to save space',
            '🧲 Highly magnetic waste',
            '✨ Very valuable material',
            '💰 Best recycling value'
          ]
        },
        {
          wasteType: 'GLASS',
          confidence: 0.88,
          recyclable: true,
          tips: [
            '🔴 100% recyclable',
            '🎨 Separate by color if possible',
            '🏷️ Remove labels',
            '✅ Excellent recycling material'
          ]
        },
        {
          wasteType: 'ORGANIC',
          confidence: 0.92,
          recyclable: true,
          tips: [
            '🌱 Can be composted',
            '🌍 Reduces landfill waste',
            '🌿 Creates nutrient-rich soil',
            '♻️ Best for environment'
          ]
        }
      ];
      
      const randomDetection = mockDetections[Math.floor(Math.random() * mockDetections.length)];
      
      setImageDetections(prev => ({
        ...prev,
        [imageId]: {
          ...randomDetection,
          detected: true
        }
      }));
      
      setDetectingImage(null);
      
      // Auto-fill form with detected type if it's the first image
      if (imageIds.length > 0 && imageId === imageIds[0] && randomDetection.wasteType) {
        setFormData(prev => ({
          ...prev,
          wasteCategory: randomDetection.wasteType
        }));
      }
    }, 2000);
  };

  const removeImage = (index) => {
    const imageId = imageIds[index];
    
    // Clean up timer if exists
    if (imageDetectionTimers.current[imageId]) {
      clearTimeout(imageDetectionTimers.current[imageId]);
      delete imageDetectionTimers.current[imageId];
    }
    
    // Remove image detection result
    const newDetections = { ...imageDetections };
    delete newDetections[imageId];
    setImageDetections(newDetections);
    
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setImageIds(imageIds.filter((_, i) => i !== index));
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
      
      // Append all form fields with proper console logging
      console.log('📝 Form Data before submission:', {
        wasteCategory: formData.wasteCategory,
        wasteType: formData.wasteType,
        quantity: formData.quantity,
        unit: formData.unit,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        imagesCount: images.length
      });
      
      data.append('wasteCategory', formData.wasteCategory);
      data.append('wasteType', formData.wasteType);
      data.append('quantity', formData.quantity);
      data.append('unit', formData.unit);
      data.append('description', formData.description);
      data.append('address', formData.address);
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);

      // Append images
      images.forEach((image, index) => {
        console.log(`📸 Adding image ${index + 1}:`, image.name);
        data.append('images', image);
      });

      console.log('📤 Sending request to /recycle...');
      const response = await axios.post('/recycle', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('✅ Recycle request created:', response.data);
      
      // Check if AI detection was successful
      if (response.data.data?.aiDetection?.detected) {
        console.log('🤖 AI Detection Result:', response.data.data.aiDetection);
        setAiDetection(response.data.data.aiDetection);
      }
      
      navigate('/recycles');
    } catch (error) {
      console.error('❌ Failed to create recycle:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Try to extract the most helpful error message
      let errorMsg = 'Failed to create recycle request';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.statusText) {
        errorMsg = error.response.statusText;
      }
      
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-3xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">📦 Create Recycle Request</h1>
        <p className="text-gray-600">Upload photos of waste and let AI identify the type automatically</p>
      </div>

      {/* AI Detection Result Display - After Form Submission */}
      {aiDetection && aiDetection.detected && (
        <div className="card mb-6 border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <CheckCircle className="text-green-600 mt-1" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-800 mb-3">🤖 AI Waste Detection Complete!</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Detected Waste Type */}
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600 font-semibold mb-1">Detected Waste Type</p>
                  <p className="text-2xl font-bold text-green-700">{aiDetection.wasteType}</p>
                  <p className="text-xs text-gray-500 mt-1">Automatically identified</p>
                </div>
                
                {/* Confidence Score */}
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600 font-semibold mb-2">Confidence Score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all" 
                        style={{ width: `${aiDetection.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xl font-bold text-green-700 min-w-fit">
                      {Math.round(aiDetection.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Recyclability Status */}
              <div className={`rounded-lg p-3 mb-4 border-2 ${
                aiDetection.recyclable 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-orange-50 border-orange-300'
              }`}>
                <p className="text-sm font-semibold mb-1">
                  {aiDetection.recyclable ? '♻️ Recyclable Material' : '⚠️ Non-Recyclable'}
                </p>
                <p className={`text-sm ${aiDetection.recyclable ? 'text-green-700' : 'text-orange-700'}`}>
                  {aiDetection.recyclable 
                    ? 'This waste type can be recycled and reprocessed into new products.' 
                    : 'This material requires special handling or may not be recyclable.'}
                </p>
              </div>

              {/* Recycling Tips */}
              {aiDetection.tips && aiDetection.tips.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-green-600" />
                    Recycling Tips for {aiDetection.wasteType}
                  </p>
                  <ul className="space-y-2">
                    {aiDetection.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <span className="text-green-600 font-bold text-lg leading-none">→</span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Detection Failed */}
      {aiDetection && !aiDetection.detected && (
        <div className="card mb-6 border-2 border-yellow-400 bg-yellow-50">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-bold text-yellow-800 mb-1">⚠️ AI Detection Could Not Process Image</h3>
              <p className="text-sm text-yellow-700">
                The AI couldn't identify the waste type from the image. Please verify the image quality and try again, or manually select the waste category.
              </p>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Upload Images (Max 5)
              </label>
              <span className="text-xs bg-eco-main text-white px-2 py-1 rounded-full font-semibold">
                🤖 AI Detection Enabled
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Upload clear photos of your waste. AI will automatically detect the type and provide recycling tips.
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-eco-main transition-colors">
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
              <p className="text-sm text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB each</p>
              {images.length > 0 && (
                <p className="text-xs text-eco-main font-semibold mt-2">
                  📷 {images.length} image{images.length !== 1 ? 's' : ''} added
                </p>
              )}
            </div>

            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">📸 Your Images</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => {
                  const imageId = imageIds[index];
                  const detection = imageDetections[imageId];
                  const isDetecting = detectingImage === imageId;
                  
                  return (
                    <div key={imageId} className="relative group">
                      <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden relative">
                        <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        
                        {/* Detection Loading Overlay */}
                        {isDetecting && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                            <div className="flex flex-col items-center gap-2">
                              <Loader className="w-6 h-6 text-white animate-spin" />
                              <span className="text-white text-xs font-semibold">Detecting...</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Detection Success Badge */}
                        {detection && !isDetecting && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 rounded-lg">
                            <Sparkles className="w-5 h-5 text-yellow-300 mb-1" />
                            <span className="text-white text-xs font-bold text-center mb-1">🤖 AI Detected</span>
                            <span className="text-yellow-300 text-xs font-semibold">{detection.wasteType}</span>
                            <span className="text-green-300 text-xs">
                              {Math.round(detection.confidence * 100)}% confident
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                </div>
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