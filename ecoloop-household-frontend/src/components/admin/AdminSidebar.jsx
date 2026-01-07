import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle,
  Gift,
  Recycle,
  Trophy,
  FileText,
  Users,
  Star,
  LogOut,
  Home
} from 'lucide-react';

const AdminSidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const menuItems = [
    {
      label: 'Dashboard',
      icon: BarChart3,
      path: '/admin/dashboard'
    },
    {
      label: 'NGO Verification',
      icon: CheckCircle,
      path: '/admin/ngos'
    },
    {
      label: 'Donations',
      icon: Gift,
      path: '/admin/donations'
    },
    {
      label: 'Recyclers',
      icon: Recycle,
      path: '/admin/recyclers'
    },
    {
      label: 'NGO Ratings',
      icon: Star,
      path: '/admin/ngo-ratings'
    },
    {
      label: 'Leaderboard',
      icon: Trophy,
      path: '/admin/leaderboard'
    },
    {
      label: 'Reports',
      icon: FileText,
      path: '/admin/reports'
    }
  ];

  return (
    <aside className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 bg-white border-r border-gray-200 shadow-lg overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-eco-main text-white shadow-md'
                        : 'text-gray-700 hover:bg-primary-50 hover:text-eco-main'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Back to Landing */}
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
        >
          <Home size={20} />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
