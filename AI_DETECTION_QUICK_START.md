# 🤖 AI Waste Detection - Quick Start Guide

## How to Use the AI Waste Detection Feature

### Step 1: Start the Application
```bash
# Terminal 1 - Backend
cd ecoloop-household-backend
npm start

# Terminal 2 - Frontend  
cd ecoloop-household-frontend
npm run dev
```

### Step 2: Login to Household Account
- Go to http://localhost:5173
- Login with your household credentials
- Navigate to Dashboard

### Step 3: Create a Recycle Request
1. Click "Create Recycle Request" or go to `/recycles/create`
2. You'll see the form with image upload section

### Step 4: Upload Waste Images
1. Click "Click to upload" button
2. Select clear photos of your waste (1-5 images)
3. Immediately see:
   - **Loading animation**: "Detecting..." while AI analyzes
   - **Success badge**: Shows waste type and confidence once detected

### Step 5: Verify & Submit
1. Form auto-fills with detected waste type
2. You can manually override if needed
3. Select quantity and location
4. Click "Create Recycle Request"

### Step 6: View AI Results
After submission, you'll see a detailed card showing:
- ✅ **Detected Waste Type** - What AI identified
- 📊 **Confidence Score** - How confident the AI is (0-100%)
- ♻️ **Recyclability Status** - Can it be recycled?
- 💡 **Recycling Tips** - Specific advice for that waste type

---

## 📸 Example: Plastic Bottle

### What You Upload:
- Clear photo of a plastic bottle

### What AI Shows:
```
🤖 AI Detection Complete!

Detected Waste Type: PLASTIC
Confidence Score: 85%
Recyclable: ✅ Yes

Recycling Tips:
→ ♻️ Rinse the plastic before recycling
→ 🏷️ Remove labels and caps  
→ 📦 Flatten to save space
→ ✅ Highly recyclable item
```

---

## 📸 Example: Paper/Cardboard

### What You Upload:
- Photo of cardboard or newspaper

### What AI Shows:
```
🤖 AI Detection Complete!

Detected Waste Type: PAPER
Confidence Score: 78%
Recyclable: ✅ Yes

Recycling Tips:
→ 📄 Keep dry and clean
→ ✂️ Flatten to save space
→ 🏷️ Remove plastic windows
→ 🔐 Good for recycling
```

---

## 🎯 Best Practices for AI Detection

### ✅ DO:
- Upload clear, well-lit photos
- Show the waste item prominently
- Use photos taken from above or at angle
- Include multiple angles for accuracy
- Clean waste before photographing

### ❌ DON'T:
- Upload blurry or dark images
- Take photos from too far away
- Hide the waste item
- Mix multiple waste types in one photo
- Upload very small objects

### 📸 Tips for Better Detection:
1. **Lighting**: Use natural sunlight when possible
2. **Angle**: Take photos from 45-90 degrees
3. **Distance**: Keep object 20-50cm from camera
4. **Clarity**: Ensure object is in focus
5. **Context**: Show the waste item clearly

---

## 🤖 AI Detection Process

```
Upload Image
    ↓
    ├─ Image sent to Google Vision API
    ├─ API analyzes image features
    ├─ System classifies waste type
    ├─ Calculates confidence score
    ├─ Generates recycling tips
    ↓
Show Results
    ├─ Display waste type
    ├─ Show confidence %
    ├─ Show recyclability
    ├─ Display tips
    ↓
Form Auto-Fill
    └─ Set waste category automatically
```

---

## 📊 Supported Waste Types

| Type | Recyclable | Icon |
|------|-----------|------|
| PLASTIC | ✅ Yes | 🔵 |
| PAPER | ✅ Yes | 📄 |
| METAL | ✅ Yes | 🥫 |
| GLASS | ✅ Yes | 🔴 |
| ORGANIC | ✅ Yes | 🌱 |
| E_WASTE | ✅ Yes | 💻 |
| HAZARDOUS | ❌ No | ⚠️ |

---

## 🐛 Troubleshooting

### "Detecting..." never completes?
- Wait 5-10 seconds
- Try refreshing page
- Check browser console for errors

### Wrong waste type detected?
- Try uploading a clearer image
- Ensure good lighting
- Show the object more prominently
- You can manually change the category

### No detection badge appears?
- Check if GOOGLE_VISION_ENABLED=true in .env
- Verify credentials are configured
- Check backend logs for errors

### Submit button disabled?
- Fill in all required fields
- Select location on map
- Ensure at least 1 image uploaded

---

## 🚀 Advanced Features

### Confidence Score
- **80-100%**: Very confident - trust the detection
- **60-79%**: Fairly confident - review the category
- **Below 60%**: Low confidence - manually verify

### Recyclability Info
- **Green (✅)**: Can be recycled through normal channels
- **Orange/Red (❌)**: Requires special handling or non-recyclable

### Auto-Fill Intelligence
- Only first image auto-fills the category
- You can upload up to 5 images total
- All images sent to backend for storage

---

## 💾 Data Stored

When you create a recycle request, the system stores:
- ✅ Detected waste type
- ✅ Confidence score
- ✅ Recyclability status
- ✅ Recycling tips
- ✅ Detected items
- ✅ Category scores

This data helps with:
- Better matching with recyclers
- Analytics and insights
- User profile building
- Environmental impact tracking

---

## 📱 Mobile Tips

The feature works on mobile devices:
1. Click upload to use device camera
2. Take photo directly from app
3. AI processes immediately
4. See results in real-time

---

## ❓ FAQs

**Q: Can I upload multiple images?**
A: Yes! You can upload 1-5 images. The first one auto-fills the category.

**Q: What if detection is wrong?**
A: You can manually select the correct waste type from the dropdown.

**Q: Do I need internet for detection?**
A: Yes, AI detection requires internet connection.

**Q: Is my image data saved?**
A: Images are uploaded to Cloudinary. Detection results stored in MongoDB.

**Q: How accurate is the AI?**
A: Generally 75-95% accurate. Depends on image quality.

**Q: Can I delete a request after creation?**
A: Yes, only if it hasn't been accepted yet.

---

## 🎓 Learning More

- View AI_DETECTION_IMPLEMENTATION.md for technical details
- Check MongoDB records for stored detection data
- Review backend logs for API calls

---

**Version**: 1.0  
**Last Updated**: January 8, 2026  
**Status**: ✅ Ready to Use
