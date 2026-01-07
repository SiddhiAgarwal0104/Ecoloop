# EcoLoop Recycler Frontend

Frontend application for recyclers to manage waste collection requests in the EcoLoop platform.

## Features

- **Recycler Authentication**: Login and registration
- **Request Discovery**: View available recycle requests on map and list
- **Request Management**: Accept and track recycling requests
- **Real-time Navigation**: Live directions to pickup locations
- **Performance Tracking**: View statistics and ratings
- **Profile Management**: Update profile and preferences

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Build

```bash
npm run build
```

## Project Structure

- `pages/` - Page components (Login, Dashboard, etc.)
- `components/` - Reusable UI components
- `context/` - React Context for state management
- `api/` - API integration and axios setup
- `hooks/` - Custom React hooks
- `utils/` - Utility functions

## Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Responsive Design** - Mobile-first approach

## Design System

The frontend uses the same design system as the household frontend:

### Colors
- **Primary (Eco Green)**: `#10b981`
- **Dark**: `#047857`
- **Light**: `#d1fae5`
- **Accent (Amber)**: `#f59e0b`

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Primary, Secondary, Danger variants
- **Inputs**: Consistent styling with focus states
- **Status Badges**: Color-coded by status

## Environment Variables

Create a `.env.local` file:

```
VITE_API_URL=http://localhost:5001/api
```

## Technologies

- React 18
- React Router v6
- Axios
- Tailwind CSS
- Vite
- Lucide React
- date-fns
