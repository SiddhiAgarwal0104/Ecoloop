import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();

  // ✅ Show loader while auth is checking
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // ❌ No token → login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Token present → allow
  return children;
};

export default PrivateRoute;


