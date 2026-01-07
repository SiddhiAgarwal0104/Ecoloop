import React, { useState } from 'react';
import { Menu, X, LogOut, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';

/**
 * Navbar Component
 * Top navigation bar with menu and user controls
 */
const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Title */}
        <div className="navbar-logo">
          <div className="navbar-logo-icon">
            <Leaf className="text-white" size={28} />
          </div>
          <div className="navbar-logo-text">
            <h1 className="navbar-logo-title">ECOLOOP</h1>
            <p className="navbar-logo-subtitle">Recycler</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-eco-dark">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <img
                src={user.profileImage || 'https://via.placeholder.com/40'}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-eco-main"
              />
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn btn-danger btn-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-eco-dark hover:text-eco-main transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 px-6 py-4 space-y-4 bg-white">
          {user && (
            <>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <img
                  src={user.profileImage || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-eco-main"
                />
                <div>
                  <p className="text-sm font-semibold text-eco-dark">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full btn btn-danger btn-sm justify-center"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
