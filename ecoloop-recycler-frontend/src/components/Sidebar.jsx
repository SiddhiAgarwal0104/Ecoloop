import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Bell, User } from 'lucide-react';

/**
 * Sidebar Component
 * Left navigation sidebar with menu links
 */
const Sidebar = () => {
  const menuItems = [
    {
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard'
    },
    {
      label: 'Available Requests',
      icon: FileText,
      path: '/requests'
    },
    {
      label: 'My Requests',
      icon: FileText,
      path: '/my-requests'
    },
    {
      label: 'Notifications',
      icon: Bell,
      path: '/notifications'
    },
    {
      label: 'Profile',
      icon: User,
      path: '/profile'
    }
  ];

  return (
    <aside className="sidebar">
      {/* Logo - Hidden */}
      <div className="p-4 border-b border-[#c8e6c9] hidden">
        <div className="flex items-center gap-3">
          <div className="navbar-logo-icon">
            <span className="text-lg">♻️</span>
          </div>
          <div>
            <h2 className="font-bold text-lg text-eco-dark">EcoLoop</h2>
            <p className="text-xs text-gray-600">Recycler</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${
                  isActive
                    ? 'nav-link-active'
                    : 'nav-link-inactive'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Stats */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#c8e6c9] w-64">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-[#c8e6c9]">
          <p className="text-xs text-gray-600 font-medium mb-2">App Version</p>
          <p className="font-bold text-sm text-eco-dark">1.0.0</p>
          <p className="text-xs text-gray-600 mt-2">Status: <span className="text-green-600 font-semibold">Active</span></p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
