import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CompleteProfile from './pages/CompleteProfile';

// Household Pages
import Dashboard from './pages/Dashboard';
import MyDonations from './pages/MyDonations';
import CreateDonation from './pages/CreateDonation';
import MyRecycles from './pages/MyRecycles';
import CreateRecycle from './pages/CreateRecycle';

// NGO Pages
import NGODashboard from './pages/NGODashboard';
import NGOAvailableDonations from './pages/NGOAvailableDonations';
import NGOAcceptedDonations from './pages/NGOAcceptedDonations';

// Recycler Pages
import RecyclerDashboard from './pages/RecyclerDashboard';
import RecyclerRequests from './pages/RecyclerRequests';
import RecyclerNavigation from './pages/RecyclerNavigation';

// Common Pages
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Badges from './pages/Badges';
import Leaderboard from './pages/Leaderboard';
import ChatPage from './pages/ChatPage';

/**
 * Role-based redirect component
 * Redirects users to their appropriate dashboard based on role
 */
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Role-based routing
  switch (user.role) {
    case 'NGO':
      return <Navigate to="/ngo/dashboard" replace />;
    case 'RECYCLER':
      return <Navigate to="/recycler/dashboard" replace />;
    case 'HOUSEHOLD':
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

/**
 * Main App Component
 * Routes configuration and context providers
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Profile Completion Route (outside layout) */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile/complete" element={<CompleteProfile />} />
          </Route>

          {/* Protected Routes with Layout */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              {/* Role-based root redirect */}
              <Route path="/" element={<RoleBasedRedirect />} />
              
              {/* Household Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/donations" element={<MyDonations />} />
              <Route path="/donations/create" element={<CreateDonation />} />
              <Route path="/recycles" element={<MyRecycles />} />
              <Route path="/recycles/create" element={<CreateRecycle />} />
              
              {/* NGO Routes */}
              <Route path="/ngo/dashboard" element={<NGODashboard />} />
              <Route path="/ngo/donations/available" element={<NGOAvailableDonations />} />
              <Route path="/ngo/donations/accepted" element={<NGOAcceptedDonations />} />
              
              {/* Recycler Routes */}
              <Route path="/recycler/dashboard" element={<RecyclerDashboard />} />
              <Route path="/recycler/requests" element={<RecyclerRequests />} />
              <Route path="/recycler/my-requests" element={<MyRecycles />} />
              <Route path="/recycler/navigate/:recycleId" element={<RecyclerNavigation />} />
              
              {/* Common Routes (accessible by all roles) */}
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/badges" element={<Badges />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>
          </Route>

          {/* Fallback - role-based redirect */}
          <Route path="*" element={<PrivateRoute><RoleBasedRedirect /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;