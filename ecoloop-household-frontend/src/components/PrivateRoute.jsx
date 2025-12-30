import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ❌ Logged in but wrong role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === "HOUSEHOLD") return <Navigate to="/dashboard" replace />;
    if (user.role === "NGO") return <Navigate to="/ngo/dashboard" replace />;
    if (user.role === "RECYCLER") return <Navigate to="/recycler/dashboard" replace />;
  }

  // ✅ Allowed
  return <Outlet />;
};

export default PrivateRoute;
