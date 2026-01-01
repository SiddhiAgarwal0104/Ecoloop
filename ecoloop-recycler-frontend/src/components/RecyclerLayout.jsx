import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useRecyclerAuth } from '../context/RecyclerAuthContext';

const RecyclerLayout = () => {
  const { user, logout } = useRecyclerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-eco-main">EcoLoop</h1>
          <p className="text-xs text-gray-500">Recycler Management</p>
        </div>

        <nav className="mt-6">
          {[
            ['/dashboard', 'Dashboard'],
            ['/requests', 'Available Requests'],
            ['/accepted-requests', 'My Requests'],
            ['/statistics', 'Statistics'],
            ['/profile', 'Profile'],
          ].map(([path, label]) => (
            <Link
              key={path}
              to={path}
              className={`block px-6 py-3 ${
                isActive(path)
                  ? 'bg-eco-light text-eco-dark font-semibold border-r-4 border-eco-main'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Logged in as</p>
            <p className="text-xs text-gray-500">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full btn-secondary text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RecyclerLayout;
