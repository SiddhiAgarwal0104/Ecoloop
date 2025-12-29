import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import CompleteProfile from './pages/CompleteProfile'  // ⭐ NEW - For Google users
import Dashboard from './pages/Dashboard'
import MyDonations from './pages/MyDonations'
import CreateDonation from './pages/CreateDonation'
import MyRecycles from './pages/MyRecycles'
import CreateRecycle from './pages/CreateRecycle'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ⭐ NEW: Profile Completion Route (for Google sign-in users) */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile/complete" element={<CompleteProfile />} />
          </Route>

          {/* Protected Routes with Layout */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/donations" element={<MyDonations />} />
              <Route path="/donations/create" element={<CreateDonation />} />
              <Route path="/recycles" element={<MyRecycles />} />
              <Route path="/recycles/create" element={<CreateRecycle />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App