# EcoLoop Recycler - Frontend Documentation

## Overview

Frontend application for EcoLoop Recycler module built with React 18, Vite, and Tailwind CSS. This is a production-grade web application for waste collectors (recyclers) to manage recycling requests and track their performance.

**Key Features:**
- User authentication (login/register) with JWT
- Dashboard with statistics and recent requests
- Browse and accept nearby recycling requests
- Track accepted requests with real-time status updates
- User profile management with image uploads
- Notification system for request updates
- Location-based filtering for nearby requests
- Responsive design for mobile and desktop

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI library |
| Vite | 4.x | Build tool and dev server |
| React Router | 6.x | Client-side routing |
| Tailwind CSS | 3.x | Styling framework |
| Axios | Latest | HTTP client |
| Lucide React | Latest | Icon library |
| Cloudinary | Latest | Image hosting |

## Project Structure

```
ecoloop-recycler-frontend/
├── src/
│   ├── api/                    # API integration
│   │   └── axios.js           # Axios instance with interceptors
│   │
│   ├── components/            # React components
│   │   ├── UI/               # Reusable UI components
│   │   │   ├── Card.jsx      # Card wrapper component
│   │   │   ├── Button.jsx    # Button with variants
│   │   │   ├── Input.jsx     # Text input field
│   │   │   ├── Modal.jsx     # Dialog/modal component
│   │   │   ├── Alert.jsx     # Alert component
│   │   │   ├── Badge.jsx     # Status badge
│   │   │   ├── Select.jsx    # Select dropdown
│   │   │   ├── Textarea.jsx  # Textarea input
│   │   │   ├── LoadingSpinner.jsx  # Loading indicator
│   │   │   └── index.js      # UI components export
│   │   │
│   │   ├── Layout.jsx        # Main layout wrapper
│   │   ├── Navbar.jsx        # Top navigation
│   │   ├── Sidebar.jsx       # Left sidebar menu
│   │   ├── PrivateRoute.jsx  # Protected route wrapper
│   │   ├── LocationPicker.jsx # Geolocation component
│   │   └── index.js          # Components export
│   │
│   ├── config/               # Configuration files
│   │   ├── config.js         # App configuration
│   │   └── constants.js      # Constants and enums
│   │
│   ├── context/              # React Context
│   │   └── RecyclerAuthContext.jsx  # Auth state management
│   │
│   ├── hooks/                # Custom React hooks
│   │   └── index.js          # useAuth, useForm, useApi, useRecyclerLocation
│   │
│   ├── pages/                # Page components
│   │   ├── auth/
│   │   │   ├── Login.jsx     # Login page
│   │   │   └── Register.jsx  # Registration page
│   │   │
│   │   ├── Dashboard.jsx     # Main dashboard
│   │   ├── Profile.jsx       # User profile
│   │   ├── CompleteProfile.jsx  # Profile completion
│   │   ├── MyRecycles.jsx    # My accepted requests
│   │   ├── MyDonations.jsx   # Available requests
│   │   ├── Notifications.jsx # Notifications
│   │   └── index.js          # Pages export
│   │
│   ├── utils/                # Utility functions
│   │   └── helpers.js        # formatCurrency, calculateDistance, etc
│   │
│   ├── App.jsx               # Root component with routing
│   ├── main.jsx              # React DOM entry point
│   ├── index.css             # Global styles
│   └── .env.example          # Environment variables template
│
├── public/                   # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── README.md                # Setup guide
```

## Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend API running on `http://localhost:5001`

### Steps

1. **Clone repository**
```bash
cd ecoloop-recycler-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env.local
```

4. **Configure environment variables**
```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_APP_NAME=EcoLoop Recycler
```

5. **Start development server**
```bash
npm run dev
```

Server runs on `http://localhost:5173`

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Component Usage Guide

### UI Components

#### Button
```jsx
import { Button } from './components/UI';

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

// Variants: primary, secondary, danger, success, ghost
// Sizes: sm, md, lg
```

#### Input
```jsx
import { Input } from './components/UI';

<Input
  type="email"
  label="Email"
  placeholder="user@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  required
/>
```

#### Card
```jsx
import { Card } from './components/UI';

<Card variant="elevated">
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>

// Variants: default, elevated, outlined
```

#### Modal
```jsx
import { Modal, Button } from './components/UI';

<Modal isOpen={isOpen} onClose={handleClose} title="Confirm">
  <p>Are you sure?</p>
</Modal>
```

#### Alert
```jsx
import { Alert } from './components/UI';

<Alert 
  type="success" 
  message="Success!" 
  dismissible 
  onClose={handleClose}
/>

// Types: success, error, warning, info
```

#### Badge
```jsx
import { Badge } from './components/UI';

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>

// Variants: primary, success, warning, danger, info, neutral
```

### Custom Hooks

#### useAuth
```jsx
import { useAuth } from './hooks';

const { user, isAuthenticated, login, logout } = useAuth();
```

#### useForm
```jsx
import { useForm } from './hooks';

const { values, errors, handleChange, handleSubmit } = useForm(
  { email: '', password: '' },
  validateFunction,
  submitFunction
);
```

#### useApi
```jsx
import { useApi } from './hooks';

const { data, loading, error, makeRequest } = useApi();

// Usage
const fetchData = async () => {
  const result = await makeRequest('GET', '/api/endpoint');
};
```

#### useRecyclerLocation
```jsx
import { useRecyclerLocation } from './hooks';

const { latitude, longitude, loading, error, getCurrentLocation } = useRecyclerLocation();
```

## API Integration

### Axios Setup
All HTTP requests use Axios instance with:
- JWT token auto-attachment to headers
- Automatic error handling
- Request/response interceptors
- Base URL configuration

```javascript
// Example API call
import axios from './api/axios';

const response = await axios.get('/requests');
const created = await axios.post('/requests', data);
```

### Endpoints

**Authentication:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile

**Requests:**
- `GET /requests` - Get available requests
- `GET /requests/nearby` - Get nearby requests
- `POST /requests/:id/accept` - Accept request
- `GET /requests/my-requests` - Get user's requests
- `PUT /requests/:id` - Update request status

**Dashboard:**
- `GET /dashboard` - Get dashboard data
- `GET /dashboard/metrics` - Get performance metrics

**Notifications:**
- `GET /notifications` - Get notifications
- `PUT /notifications/:id` - Mark as read

## Authentication Flow

1. User navigates to `/login` or `/register`
2. Submits credentials via login/register form
3. Backend returns JWT token
4. Token stored in localStorage
5. Token automatically attached to all requests via interceptor
6. PrivateRoute wrapper checks authentication
7. Redirect to dashboard if authenticated

## Styling & Design System

### Colors
```css
Primary (Emerald): #10b981
Dark: #047857
Light: #d1fae5
Background: #f3f4f6
```

### Typography
- Headlines: 18px-32px, font-bold
- Body: 14px-16px, font-regular
- Small: 12px-14px, font-regular

### Responsive Breakpoints
- Mobile: 320px-768px
- Tablet: 768px-1024px
- Desktop: 1024px+

## Error Handling

All pages implement:
- Try-catch blocks for async operations
- User-friendly error messages
- Console logging with emoji indicators
- Error state display in UI

```javascript
try {
  const response = await fetchData();
} catch (error) {
  console.error('❌ Error:', error);
  setError(error.message);
}
```

## Performance Optimization

- Code splitting with React Router
- Lazy loading of components
- Image optimization with Cloudinary
- Memoization of expensive computations
- Debounced search inputs

## Best Practices

1. **Component Organization**
   - Keep components small and focused
   - Use composition over inheritance
   - Extract reusable logic to custom hooks

2. **State Management**
   - Use Context API for global state
   - Local state for component-specific data
   - Hooks for side effects

3. **API Calls**
   - Use custom useApi hook for data fetching
   - Implement loading and error states
   - Handle network errors gracefully

4. **Styling**
   - Use Tailwind CSS utility classes
   - Follow mobile-first approach
   - Maintain design system consistency

5. **Accessibility**
   - Use semantic HTML
   - Add ARIA labels where needed
   - Ensure keyboard navigation

## Troubleshooting

### CORS Errors
- Ensure backend is running on port 5001
- Check `VITE_API_BASE_URL` in `.env.local`
- Verify backend CORS configuration

### Authentication Issues
- Clear localStorage
- Check JWT token expiration
- Verify login credentials
- Check backend JWT secret

### Image Upload Issues
- Check Cloudinary configuration
- Verify file size (max 5MB)
- Check allowed file types (jpg, png, webp)
- Ensure permissions in Cloudinary dashboard

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Considerations

- JWT tokens stored in localStorage
- HTTPS required in production
- CORS enabled only for trusted origins
- Input validation on all forms
- Output encoding to prevent XSS
- CSRF tokens for state-changing requests

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME=EcoLoop Recycler
```

### Deployment Options
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Docker containerization

## Contributing

1. Create feature branch
2. Make changes with JSDoc comments
3. Add error handling
4. Test on mobile and desktop
5. Submit pull request

## License

Proprietary - EcoLoop Project

## Support

For issues and questions:
- Check existing documentation
- Review backend API documentation
- Check browser console for errors
- Review network tab in DevTools
