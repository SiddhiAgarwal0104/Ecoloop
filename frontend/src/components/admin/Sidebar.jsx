import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Leaf, 
  Users,
  FileText,
  TrendingUp
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Locality Analytics',
      path: '/admin/localities',
      icon: MapPin
    },
    {
      name: 'Sustainability Impact',
      path: '/admin/sustainability',
      icon: Leaf
    },
    {
      name: 'Partner Monitoring',
      path: '/admin/partners',
      icon: Users
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: FileText
    }
  ];

  return (
    <aside className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 bg-white border-r border-gray-200 shadow-lg overflow-y-auto">
      <nav className="p-4">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Navigation
          </h2>
        </div>

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
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gradient-to-br from-eco-light to-primary-100 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-eco-main" size={20} />
            <h3 className="font-semibold text-eco-dark">Quick Stats</h3>
          </div>
          <p className="text-xs text-gray-600 mb-3">Platform Performance</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-green-600">Active</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Uptime:</span>
              <span className="font-semibold text-eco-dark">99.9%</span>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;