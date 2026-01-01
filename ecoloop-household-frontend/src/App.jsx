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
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Profile Completion Route */}
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
              
              {/* Common Routes */}
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/badges" element={<Badges />} />
<Route path="/leaderboard" element={<Leaderboard />} />
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