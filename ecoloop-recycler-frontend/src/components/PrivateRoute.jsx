import { Navigate } from 'react-router-dom';
import { useRecyclerAuth } from '../context/RecyclerAuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useRecyclerAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
