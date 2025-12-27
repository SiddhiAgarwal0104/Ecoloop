import React, { useState } from 'react';
import { Leaf, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/login');
  };

  return (
    <header className="navbar sticky top-0 z-50 shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="bg-eco-main p-2 rounded-lg">
          <Leaf className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-eco-dark">ECOLOOP</h1>
          <p className="text-xs text-gray-600">Admin Dashboard</p>
        </div>
      </div>

      {/* Right side - User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-primary-200 transition-colors"
        >
          <div className="text-right">
            <p className="text-sm font-semibold text-eco-dark">{adminData.name || 'Admin'}</p>
            <p className="text-xs text-gray-600">{adminData.role || 'Administrator'}</p>
          </div>
          <div className="w-10 h-10 bg-eco-main rounded-full flex items-center justify-center">
            <User className="text-white" size={20} />
          </div>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2">
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700">
              <User size={16} />
              <span>Profile</span>
            </button>
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700">
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <hr className="my-2" />
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;