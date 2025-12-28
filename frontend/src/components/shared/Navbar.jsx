import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const userName = user?.name || 'User';
  const userLocality = user?.locality || '';

  return (
    <header className="navbar sticky top-0 z-50 shadow-md bg-white">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          
          <Link to="/community" className="flex items-center gap-3">
            <div className="bg-eco-main p-2 rounded-lg">
              <Leaf className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-eco-dark">ECOLOOP</h1>
              <p className="text-xs text-gray-600">Community Sharing</p>
            </div>
          </Link>
        </div>

        {/* Right side - Notifications and Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={24} className="text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-600">{userLocality}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-eco-main flex items-center justify-center text-white font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;