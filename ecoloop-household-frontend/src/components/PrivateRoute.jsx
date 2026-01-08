import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * Handles profile completion and role-based access
 */
const PrivateRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-eco-light border-t-eco-main"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if profile is complete (skip check for profile completion page)
  const profileComplete = user?.profileCompleted === true;
  const isProfileCompletionPage = location.pathname === '/profile/complete';
  const isNGO = user?.role === 'NGO';

  // Allow access to profile completion page
  if (isProfileCompletionPage) {
    return <Outlet />;
  }

  // Only redirect to profile completion if NGO and not yet completed
  // RECYCLER and HOUSEHOLD go straight to dashboard after login
  if (isNGO && !profileComplete) {
    console.log('🔄 NGO profile incomplete, redirecting to completion');
    return <Navigate to="/profile/complete" replace />;
  }

  // NGO verification check
  if (user.role === 'NGO' && !user.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verification Pending
          </h2>
          <p className="text-gray-600 mb-6">
            Your NGO profile is awaiting admin verification. You'll receive an email once approved.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="px-6 py-2 bg-eco-main text-white rounded-lg hover:bg-eco-dark transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Role-based access control (if allowedRoles specified)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('❌ Access denied: Wrong role');
    
    // Redirect to appropriate dashboard
    if (user.role === 'HOUSEHOLD') {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === 'NGO') {
      return <Navigate to="/ngo/dashboard" replace />;
    } else if (user.role === 'RECYCLER') {
      return <Navigate to="/recycler/dashboard" replace />;
    }
  }

  // All checks passed, render the protected route
  return <Outlet />;
};

export default PrivateRoute;