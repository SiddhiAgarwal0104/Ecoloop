# 🔧 AI Waste Detection - Technical Reference

## Code Structure

### Frontend State Management

```javascript
// CreateRecycle.jsx - State Variables
const [loading, setLoading] = useState(false);
const [detectingImage, setDetectingImage] = useState(null);
const [formData, setFormData] = useState({ ... });
const [images, setImages] = useState([]);
const [imagePreviews, setImagePreviews] = useState([]);
const [imageDetections, setImageDetections] = useState({});
const [aiDetection, setAiDetection] = useState(null);
const imageDetectionTimers = useRef({});
```

### Image Detection Flow

```javascript
// Step 1: User selects images
handleImageChange(event) 
  → reads files
  → creates previews
  → calls simulateAiDetection()

// Step 2: Simulate AI analysis (2-3 seconds)
simulateAiDetection(imageIndex)
  → setDetectingImage(imageIndex) // Show loading
  → setTimeout(2000ms)
  → Generate random detection
  → setImageDetections() // Show result
  → Auto-fill form if first image
  → setDetectingImage(null) // Hide loading

// Step 3: User submits form
handleSubmit(event)
  → Create FormData
  → Append images to form
  → POST /api/recycle
  → Receive AI detection from backend
  → setAiDetection() // Show final results
  → Navigate to success page
```

### Backend Processing

```javascript
// recycleController.js - createRecycleRequest()

1. Validate input fields
2. Upload images to Cloudinary
   → uploadMultipleToCloudinary()
   → Returns array of URLs

3. Detect waste from first image (if enabled)
   → detectWasteType(imageUrl)
   → Get classification results
   → Set confidence, recyclable, tips

4. Create Recycle document
   → userId
   → wasteCategory
   → images []
   → aiDetectionResult {}
   → status: 'AVAILABLE'

5. Update user stats
   → Award points for recycling

6. Return response with AI data
```

## API Contracts

### POST /api/recycle
**Request**:
```
Form Data:
- wasteCategory: string (PLASTIC, PAPER, etc.)
- wasteType: string (SEGREGATED, MIXED)
- quantity: number
- unit: string (KG, PIECES, etc.)
- description: string (optional)
- address: string
- latitude: number
- longitude: number
- images: File[] (max 5)
```

**Response**:
```json
{
  "success": true,
  "message": "Recycle request created successfully",
  "data": {
    "recycleRequest": {
      "_id": "...",
      "userId": "...",
      "wasteCategory": "PLASTIC",
      "wasteType": "SEGREGATED",
      "quantity": 2.5,
      "unit": "KG",
      "images": ["url1", "url2"],
      "status": "AVAILABLE",
      "aiDetectionResult": {
        "confidence": 0.85,
        "recyclable": true,
        "detectedItems": ["plastic bottle", "plastic bag"],
        "tips": ["Rinse before recycling", ...]
      }
    },
    "aiDetection": {
      "detected": true,
      "wasteType": "PLASTIC",
      "confidence": 0.85,
      "recyclable": true,
      "tips": ["♻️ Rinse the plastic before recycling", ...],
      "description": "Plastic waste - can be recycled...",
      "detectedItems": ["plastic bottle", ...],
      "categoryScores": { "PLASTIC": 0.85, ... }
    }
  }
}
```

## Google Vision API Integration

### detectWasteType() Function Signature
```javascript
async detectWasteType(
  imageUrl: string,      // URL or base64
  imageType: 'url'|'base64' = 'url'
): Promise<Object>
```

### Return Value
```javascript
{
  success: true,
  classification: {
    wasteType: string,           // PLASTIC, PAPER, etc.
    confidence: number,           // 0-1
    recyclable: boolean,
    detectedItems: Array<Object>, // [{name, confidence, type}]
    categoryScores: Object,        // {PLASTIC: 0.85, PAPER: 0.2, ...}
    description: string,          // Human readable
    tips: Array<string>           // Recycling advice
  },
  labels: Array,       // All detected labels
  objects: Array,      // All detected objects
  rawResponse: Object  // Full Vision API response
}
```

## Database Schema

### Recycle Model - AI Detection Fields
```javascript
aiDetectedWasteType: {
  type: String,
  enum: ['PLASTIC', 'PAPER', 'METAL', 'GLASS', 'E_WASTE', 'ORGANIC', 'HAZARDOUS', 'UNKNOWN'],
  default: null
},

aiDetectionResult: {
  confidence: Number,           // 0-1, defaults to 0
  recyclable: Boolean,          // defaults to false
  detectedItems: [
    {
      name: String,
      confidence: Number,
      type: String
    }
  ],
  tips: [String],              // Array of recycling tips
  categoryScores: Object       // Raw scores from AI
}
```

## Environment Variables

```bash
# Google Vision API Configuration
GOOGLE_VISION_ENABLED=true
GOOGLE_APPLICATION_CREDENTIALS=./config/google-vision-credentials.json

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=dz36e3qnm
CLOUDINARY_API_KEY=142844242925746
CLOUDINARY_API_SECRET=CCfdeZ1VnqbeYVLRPTU1bscMeps
```

## Error Handling

### Frontend Errors
```javascript
// Upload Error
try {
  await axios.post('/recycle', formData)
} catch (error) {
  const msg = error.response?.data?.message || error.message
  alert(msg)
  // Form remains on page for retry
}

// Image Error
if (files.length + images.length > 5) {
  alert('Maximum 5 images allowed')
  return
}
```

### Backend Errors
```javascript
// Vision API Initialization Error
if (!visionClient) {
  throw new Error('Vision API client initialization failed')
}

// Image Upload Error
try {
  imageUrls = await uploadMultipleToCloudinary(req.files)
} catch (uploadError) {
  return next(new AppError(`Image upload failed: ${uploadError.message}`, 500))
}

// Detection Error (Non-blocking)
try {
  aiDetectionResult = await detectWasteType(imageUrl)
} catch (detectionError) {
  console.warn('Vision API Error:', detectionError.message)
  // Continue without detection
}
```

## Component Integration

### Imports Required
```javascript
// Icons
import { 
  Upload,           // Upload icon
  AlertCircle,      // Warning icon
  CheckCircle,      // Success icon
  Loader,           // Loading spinner
  Leaf,             // Environment icon
  Sparkles          // AI magic icon
} from 'lucide-react'

// Components
import LocationPicker from '../components/LocationPicker'
import axios from '../api/axios'

// Hooks
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
```

## Styling Classes Used

```css
/* Cards & Containers */
.card              /* White bg with shadow */
.fade-in           /* Animation class */

/* Colors - Success (Recyclable) */
.from-green-50     /* Gradient start */
.to-emerald-50     /* Gradient end */
.border-green-400  /* Border color */
.text-green-800    /* Heading text */
.text-green-700    /* Body text */

/* Colors - Warning (Non-Recyclable) */
.bg-yellow-50      /* Background */
.border-yellow-400 /* Border */
.text-yellow-700   /* Text */

/* Loading State */
.bg-black/50       /* Semi-transparent overlay */
.animate-spin      /* Rotation animation */
.text-white        /* Contrast text */

/* Progress Bar */
.bg-gray-200       /* Empty bar bg */
.bg-gradient-to-r  /* Filled bar gradient */
.from-green-400
.to-green-600

/* Grid Layouts */
.grid              /* CSS Grid */
.grid-cols-1       /* Mobile */
.md:grid-cols-2    /* Tablet */
.lg:grid-cols-5    /* Desktop - for images */
.gap-4             /* Spacing between items */

/* Responsive Text */
.text-sm           /* Small text */
.text-lg           /* Large text */
.text-2xl          /* Extra large text */
.text-3xl          /* Huge text */

/* Fonts */
.font-semibold     /* Medium weight */
.font-bold         /* Heavy weight */
```

## Testing API Endpoints

### Using cURL
```bash
# Create recycle with image
curl -X POST http://localhost:5000/api/recycle \
  -F "wasteCategory=PLASTIC" \
  -F "wasteType=SEGREGATED" \
  -F "quantity=2.5" \
  -F "unit=KG" \
  -F "address=123 Street" \
  -F "latitude=28.7041" \
  -F "longitude=77.1025" \
  -F "images=@waste.jpg" \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman
1. Set method to POST
2. URL: `http://localhost:5000/api/recycle`
3. Tab: Body → form-data
4. Add fields: wasteCategory, quantity, etc.
5. Add file: images (select waste.jpg)
6. Tab: Headers → Add Authorization Bearer token
7. Send

## Performance Optimization

### Image Optimization
- Cloudinary auto-compresses
- Max size: 5MB per image
- Formats: JPG, PNG, WEBP
- Lazy loading for previews

### AI Processing
- Only first image analyzed
- Runs server-side (backend)
- ~2-3 seconds per image
- Non-blocking for form submission

### Frontend Optimization
- React.useState for state
- useRef for persistent timers
- CSS Grid for layout
- Lazy render detection overlays

## Debugging Tips

### Check Loading State
```javascript
console.log('detectingImage:', detectingImage)
console.log('imageDetections:', imageDetections)
```

### Verify Detection Timers
```javascript
console.log('Active timers:', imageDetectionTimers.current)
```

### Monitor Form Submission
```javascript
console.log('Form data:', formData)
console.log('Images count:', images.length)
```

### Backend Logs
```bash
# Look for these patterns
🤖 Starting waste detection...
✅ Vision API response received
📊 AI Detection result:
✅ Recycle request created successfully:
```

## Useful Console Commands

```javascript
// Test image detection
const mockDetection = {
  wasteType: 'PLASTIC',
  confidence: 0.85,
  recyclable: true,
  tips: ['Rinse', 'Remove caps', 'Flatten']
}

// Check API response
fetch('/api/recycle/MY_ID')
  .then(r => r.json())
  .then(d => console.log(d.data.aiDetection))
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| No detection badge | Timer not cleared | Check useRef cleanup |
| Form not auto-filling | First image index wrong | Check imageIndex === 0 |
| Images not showing | Preview URL expired | Revoke URL properly |
| Backend 500 error | Vision API fail | Check credentials file |
| Confidence = 0 | Detection failed | Try clearer image |
| Wrong waste type | Poor image quality | Improve lighting |

---

## References

- [Google Vision API Docs](https://cloud.google.com/vision/docs)
- [React Documentation](https://react.dev)
- [Lucide Icons](https://lucide.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Cloudinary Docs](https://cloudinary.com/documentation)

---

**Last Updated**: January 8, 2026
**Version**: 1.0 Technical Reference
