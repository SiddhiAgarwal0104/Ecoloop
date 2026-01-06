import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import CompleteProfile from './pages/CompleteProfile'
import Dashboard from './pages/Dashboard'
import MyDonations from './pages/MyDonations'
import CreateDonation from './pages/CreateDonation'
import MyRecycles from './pages/MyRecycles'
import CreateRecycle from './pages/CreateRecycle'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import NGODashboard from './pages/NGODashboard';
import NGOAvailableDonations from './pages/NGOAvailableDonations';
import NGOAcceptedDonations from './pages/NGOAcceptedDonations';
import Badges from './pages/Badges';
import Leaderboard from './pages/Leaderboard';
import ChatPage from './pages/ChatPage';
import RequestsFeed from './pages/RequestsFeed';
import MyRequests from './pages/MyRequests';
import CreateRequest from './pages/CreateRequest';
import ActiveLendings from './pages/ActiveLendings';

// Landing Page
import Landing from './pages/Landing'

// Admin Pages
import AdminLogin from './pages/AdminLogin'
import AdminRegister from './pages/AdminRegister'
import AdminCompleteProfile from './pages/AdminCompleteProfile'
import AdminDashboard from './pages/AdminDashboard'
import AdminNGOVerification from './pages/AdminNGOVerification'
import AdminDonations from './pages/AdminDonations'
import AdminRecyclers from './pages/AdminRecyclers'
import AdminLeaderboard from './pages/AdminLeaderboard'
import AdminReports from './pages/AdminReports'

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'NGO') {
    return <Navigate to="/ngo/dashboard" replace />;
  } else if (user.role === 'RECYCLER') {
    return <Navigate to="/recycler/dashboard" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landing />} />
          
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/profile/complete" element={<AdminCompleteProfile />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/ngos" element={<AdminNGOVerification />} />
          <Route path="/admin/donations" element={<AdminDonations />} />
          <Route path="/admin/recyclers" element={<AdminRecyclers />} />
          <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
          <Route path="/admin/reports" element={<AdminReports />} />

          {/* Profile Completion Route */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile/complete" element={<CompleteProfile />} />
          </Route>

          {/* Protected Routes with Layout */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              {/* Role-based root redirect */}
              <Route path="/home" element={<RoleBasedRedirect />} />
              
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
              
              {/* Common Routes */}
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
            </Route>
          </Route>

          {/* Fallback - role-based redirect */}
          <Route path="*" element={<PrivateRoute><RoleBasedRedirect /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App