# 🎨 AI Waste Detection - UI Components & Features

## Component Hierarchy

```
CreateRecycle Page
├── Header
│   ├── Title: "📦 Create Recycle Request"
│   └── Subtitle: "Upload photos of waste and let AI identify the type automatically"
│
├── AI Detection Result Card (After Form Submission)
│   ├── CheckCircle Icon (Green)
│   ├── Title: "🤖 AI Waste Detection Complete!"
│   ├── Grid Layout (2 columns)
│   │   ├── Detected Waste Type Box
│   │   │   ├── Label: "Detected Waste Type"
│   │   │   ├── Type Name (Large): "PLASTIC"
│   │   │   └── Note: "Automatically identified"
│   │   │
│   │   └── Confidence Score Box
│   │       ├── Label: "Confidence Score"
│   │       ├── Progress Bar (0-100%)
│   │       │   ├── Green gradient fill
│   │       │   └── Percentage text
│   │       └── Animated bar expansion
│   │
│   ├── Recyclability Status Box
│   │   ├── Icon: ♻️ (Recyclable) or ⚠️ (Non-recyclable)
│   │   ├── Green/Orange background
│   │   ├── Status label
│   │   └── Description
│   │
│   └── Recycling Tips Section
│       ├── Leaf Icon + Title
│       ├── Bulleted list
│       │   ├── → ♻️ Rinse the plastic
│       │   ├── → 🏷️ Remove labels
│       │   ├── → 📦 Flatten to save space
│       │   └── → ✅ Highly recyclable
│       └── Each tip with emoji + text
│
├── Form Section
│   ├── Waste Category Dropdown
│   │   ├── Default: Auto-filled from AI
│   │   ├── Options: PLASTIC, PAPER, METAL, GLASS, E_WASTE, ORGANIC
│   │   └── User can override
│   │
│   ├── Waste Type Dropdown
│   ├── Quantity Input
│   ├── Unit Dropdown
│   ├── Description TextArea
│   └── Location Picker Component
│
└── Image Upload Section
    ├── Header with Badge
    │   ├── "Upload Images (Max 5)"
    │   └── 🤖 "AI Detection Enabled" (Green Badge)
    │
    ├── Helper Text
    │   └── "Upload clear photos of your waste. AI will automatically detect..."
    │
    ├── Upload Area
    │   ├── Icon: Upload symbol (Dashed border)
    │   ├── "Click to upload" link
    │   ├── Format hint: "PNG, JPG, WEBP up to 5MB each"
    │   └── Image count: "📷 3 images added (AI analyzing...)"
    │
    └── Image Preview Grid (2-5 columns)
        ├── Image Container
        │   ├── Image preview (bg-gray-100)
        │   │
        │   ├── OVERLAY 1 - While Detecting
        │   │   ├── Semi-transparent black overlay
        │   │   ├── Loader icon (spinning)
        │   │   └── Text: "Detecting..."
        │   │
        │   ├── OVERLAY 2 - Detection Complete (On Hover)
        │   │   ├── Semi-transparent black overlay
        │   │   ├── Sparkles icon (yellow)
        │   │   ├── "🤖 AI Detected"
        │   │   ├── Waste type (yellow text)
        │   │   └── Confidence % (green text)
        │   │
        │   └── Remove Button
        │       ├── Position: Top-right
        │       ├── Icon: × (red circle)
        │       └── Hover: Darker red
```

## Visual States

### 1. Initial State (No Images)
```
┌─────────────────────────────────────────┐
│     📦 Create Recycle Request           │
│  Upload photos of waste and let AI...  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Upload Images (Max 5)  🤖 AI Detection │
│  Upload clear photos of your waste...   │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │     📤 Upload Symbol              │  │
│  │  Click to upload                  │  │
│  │  PNG, JPG, WEBP up to 5MB each   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 2. Uploading State (1-5 Images)
```
┌─────────────────────────────────────────┐
│  Upload Images (Max 5)  🤖 AI Detection │
│  📷 2 images added (AI analyzing...)    │
│                                         │
│  ┌──────┐  ┌──────────────────┐        │
│  │ IMG1 │  │ IMG2             │        │
│  │      │  │  ┌────────────┐  │        │
│  │ ×    │  │  │ Loader 🔄  │  │  ×    │
│  └──────┘  │  │ Detecting  │  │        │
│            │  └────────────┘  │        │
│            └──────────────────┘        │
└─────────────────────────────────────────┘
```

### 3. Detection Complete State
```
┌─────────────────────────────────────────┐
│  Upload Images (Max 5)  🤖 AI Detection │
│                                         │
│  ┌──────────────────┐  ┌──────────────┐│
│  │ IMG1             │  │ IMG2         ││
│  │ ┌──────────────┐ │  │ ┌──────────┐││
│  │ │ 🤖 AI        │ │  │ │🤖 AI    │││
│  │ │ PLASTIC      │ │  │ │PAPER    │││
│  │ │ 85% conf.    │ │  │ │ 78%     │││
│  │ └──────────────┘ │  │ └──────────┘││
│  │ ×                │  │ ×            ││
│  └──────────────────┘  └──────────────┘│
└─────────────────────────────────────────┘
```

### 4. AI Detection Result Card (After Submit)
```
┌──────────────────────────────────────────────┐
│ ✅ 🤖 AI Waste Detection Complete!           │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │ Detected Type    │  │ Confidence Score │ │
│  │                  │  │                  │ │
│  │ PLASTIC          │  │ [████████░] 85% │ │
│  │ Auto-identified  │  │                  │ │
│  └──────────────────┘  └──────────────────┘ │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ ♻️ Recyclable Material               │   │
│  │ This waste can be recycled &         │   │
│  │ reprocessed into new products        │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  🌿 Recycling Tips for PLASTIC              │
│  → ♻️ Rinse the plastic before recycling   │
│  → 🏷️ Remove labels and caps               │
│  → 📦 Flatten to save space                │
│  → ✅ Highly recyclable item               │
└──────────────────────────────────────────────┘
```

## Color Scheme

### Success (Recyclable)
- Background: `bg-green-50` / `from-green-50 to-emerald-50`
- Border: `border-green-400`
- Text: `text-green-800` (headings), `text-green-700` (body)
- Icons: Green color

### Warning (Non-Recyclable)
- Background: `bg-yellow-50` / `bg-orange-50`
- Border: `border-yellow-400` / `border-orange-300`
- Text: `text-yellow-800` / `text-orange-700`
- Icons: Orange/Red color

### Loading State
- Background: `bg-black/50` (semi-transparent)
- Text: `text-white`
- Icon: White with animation

### Confidence Score Bar
- Empty: `bg-gray-200`
- Filled: `bg-gradient-to-r from-green-400 to-green-600`
- Animation: Smooth expansion on fill

## Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Card Title | lg | bold | green-800 |
| Box Labels | sm | semibold | gray-600 |
| Waste Type | 2xl | bold | green-700 |
| Confidence % | xl | bold | green-700 |
| Tips Title | sm | bold | gray-800 |
| Tips Text | sm | regular | gray-700 |

## Spacing & Layout

```
Card Padding: p-4 (boxes), p-3 (items)
Grid Gap: gap-4
List Gap: space-y-2
Border Radius: rounded-lg
Box Shadow: border-2 for emphasis
Icons Size: w-4 to w-5, h-4 to h-5
```

## Animations

1. **Progress Bar Fill**
   - Duration: 0.3s
   - Type: Smooth linear
   - Effect: Width expands smoothly

2. **Loading Spinner**
   - Type: CSS spin animation
   - Duration: 1s infinite
   - Color: white on dark overlay

3. **Hover Effects**
   - Image overlay: opacity 0 → 100%
   - Transitions: 0.3s smooth
   - Shows detection badge on hover

4. **Badge Animation**
   - Appears when detection completes
   - No animation (instant)
   - Positioned as overlay

## Responsive Design

```
Mobile (< 768px)
├── Single column layout
├── Full-width upload button
└── Image grid: 2 columns

Tablet (768px - 1024px)
├── 2 column grid for form
├── 3-4 columns for images
└── Side-by-side detection boxes

Desktop (> 1024px)
├── Grid layout (all optimal)
├── 2-column boxes
├── 5-column image grid
└── Wider card layout
```

## Accessibility Features

- ✅ Semantic HTML
- ✅ ARIA labels on buttons
- ✅ Color + text for status (not color alone)
- ✅ Clear loading indicators
- ✅ High contrast text
- ✅ Keyboard navigable
- ✅ Focus states visible
- ✅ Alt text on icons

## Component Props

```javascript
// Result Card Props
{
  detected: boolean,
  wasteType: string,
  confidence: number (0-1),
  recyclable: boolean,
  tips: array<string>,
  description: string
}

// Image Preview Props
{
  src: string (blob URL),
  detection: {
    wasteType: string,
    confidence: number,
    detected: boolean
  },
  isDetecting: boolean,
  onRemove: function
}
```

## Edge Cases & States

### Loading State
- Shows spinner on image
- Text: "Detecting..."
- Prevents interaction

### Error State
- Shows alert if upload fails
- Can retry or remove image
- Error message visible

### Empty State
- Upload prompt visible
- No images: Full message shown
- Encourages action

### Success State
- Green checkmark
- Detailed info displayed
- Tips provided
- Submit button enabled

---

**Component Status**: ✅ Complete and Ready
**Last Updated**: January 8, 2026
