import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { initSocket } from './utils/socketService';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import RecyclerLayout from './components/RecyclerLayout';

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
import RecyclerMyRecycles from './pages/RecyclerMyRecycles';
import RecyclerNavigation from './pages/RecyclerNavigation';

// Common Pages
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Badges from './pages/Badges';
import Leaderboard from './pages/Leaderboard';
import ChatPage from './pages/ChatPage';

// Community Pages
import RequestsFeed from './pages/RequestsFeed';
import MyRequests from './pages/MyRequests';
import CreateRequest from './pages/CreateRequest';
import ActiveLendings from './pages/ActiveLendings';
import CommunityChat from './pages/CommunityChat';

// Landing Page
import Landing from './pages/Landing';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminCompleteProfile from './pages/AdminCompleteProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminNGOVerification from './pages/AdminNGOVerification';
import AdminDonations from './pages/AdminDonations';
import AdminRecyclers from './pages/AdminRecyclers';
import AdminRecycles from './pages/AdminRecycles';
import AdminRecyclerRatings from './pages/AdminRecyclerRatings';
import AdminLeaderboard from './pages/AdminLeaderboard';
import AdminReports from './pages/AdminReports';
import NGORatingsPage from './pages/NGORatingsPage';

/**
 * Role-based Redirect Component
 * Redirects users to their role-specific dashboard
 */
const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

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
 * Socket Initializer Component
 * Initializes Socket.IO connection after user authenticates
 */
function SocketInitializer() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('🔌 Initializing Socket.IO connection...');
        initSocket(token);
      }
    }

    // Cleanup on unmount
    return () => {
      // Disconnect socket if needed
    };
  }, [user]);

  return null;
}

/**
 * Main App Component
 * Routes configuration and context providers
 */
function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <NotificationProvider>
          <SocketInitializer />
          <Router>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<Landing />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes (Public) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin/profile/complete" element={<AdminCompleteProfile />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/ngos" element={<AdminNGOVerification />} />
            <Route path="/admin/recyclers" element={<AdminRecyclers />} />
            <Route path="/admin/donations" element={<AdminDonations />} />
            <Route path="/admin/recycles" element={<AdminRecycles />} />
            <Route path="/admin/recycler-ratings" element={<AdminRecyclerRatings />} />
            <Route path="/admin/ngo-ratings" element={<NGORatingsPage />} />
            <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
            <Route path="/admin/reports" element={<AdminReports />} />

            {/* Profile Completion Route (Protected, No Layout) */}
            <Route element={<PrivateRoute />}>
              <Route path="/profile/complete" element={<CompleteProfile />} />
            </Route>

            {/* Protected Routes with Household Layout */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                {/* Role-based Home Redirect */}
                <Route path="/home" element={<RoleBasedRedirect />} />

                {/* Household Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/donations" element={<MyDonations />} />
                <Route path="/donations/create" element={<CreateDonation />} />
                <Route path="/recycles" element={<MyRecycles />} />
                <Route path="/my-requests" element={<MyRecycles />} />
                <Route path="/recycles/create" element={<CreateRecycle />} />

                {/* NGO Routes */}
                <Route path="/ngo/dashboard" element={<NGODashboard />} />
                <Route path="/ngo/donations/available" element={<NGOAvailableDonations />} />
                <Route path="/ngo/donations/accepted" element={<NGOAcceptedDonations />} />

                {/* Common Routes (Household/NGO) */}
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/badges" element={<Badges />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/chat" element={<ChatPage />} />

                {/* Community Sharing Routes */}
                <Route path="/community/requests" element={<RequestsFeed />} />
                <Route path="/community/my-requests" element={<MyRequests />} />
                <Route path="/community/create-request" element={<CreateRequest />} />
                <Route path="/community/active-lendings" element={<ActiveLendings />} />
                <Route path="/community/chat/:chatRoomId" element={<CommunityChat />} />
              </Route>
            </Route>

            {/* Protected Routes with Recycler Layout */}
            <Route element={<PrivateRoute />}>
              <Route element={<RecyclerLayout />}>
                {/* Recycler Routes */}
                <Route path="/recycler/dashboard" element={<RecyclerDashboard />} />
                <Route path="/recycler/requests" element={<RecyclerRequests />} />
                <Route path="/recycler/my-requests" element={<RecyclerMyRecycles />} />
                <Route path="/recycler/navigate/:recycleId" element={<RecyclerNavigation />} />
                <Route path="/recycler/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Fallback - Redirect to role-based dashboard */}
            <Route path="*" element={<PrivateRoute><RoleBasedRedirect /></PrivateRoute>} />
          </Routes>
        </Router>
        </NotificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;