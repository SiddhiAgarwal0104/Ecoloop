import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Heart, 
  Recycle, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X,
  Award,
  TrendingUp,
  MessageCircle,
  Users,
  PlusCircle,
  Leaf,
  Trophy,
  Share2,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FloatingChatbotButton from './FloatingChatbotButton';

/**
 * Layout Component
 * Main layout wrapper with navigation for all roles
 */
const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const getNavItems = () => {
    console.log('🔧 getNavItems called, user.role:', user?.role);
    const role = user?.role?.toUpperCase();
    
    if (role === 'NGO') {
      console.log('📋 Returning NGO nav items');
      return [
        { path: '/ngo/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/ngo/donations/available', icon: Package, label: 'Available Donations' },
        { path: '/ngo/donations/accepted', icon: Heart, label: 'My Donations' },
        { path: '/notifications', icon: Bell, label: 'Notifications' },
        { path: '/profile', icon: User, label: 'Profile' },
      ];
    } else if (role === 'RECYCLER') {
      console.log('♻️ Returning RECYCLER nav items');
      return [
        { path: '/recycler/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/recycler/requests', icon: Package, label: 'Available Requests' },
        { path: '/recycler/my-requests', icon: Check, label: 'My Accepted Requests' },
        { path: '/notifications', icon: Bell, label: 'Notifications' },
        { path: '/profile', icon: User, label: 'Profile' },
      ];
    } else {
      // HOUSEHOLD (default)
      console.log('🏠 Returning HOUSEHOLD nav items');
      return [
        { path: '/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/donations', icon: Heart, label: 'My Donations' },
        { path: '/donations/create', icon: PlusCircle, label: 'Create Donation' },
        { path: '/recycles', icon: Recycle, label: 'My Recycles' },
        { path: '/recycles/create', icon: PlusCircle, label: 'Create Recycle' },
        { path: '/community/requests', icon: Share2, label: 'Community' },
        { path: '/badges', icon: Award, label: 'Badges' },
        { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
        { path: '/chat', icon: MessageCircle, label: 'AI Waste Coach' },
        { path: '/notifications', icon: Bell, label: 'Notifications' },
        { path: '/profile', icon: User, label: 'Profile' },
      ];
    }
  };

  const navItems = getNavItems();

  const isActive = (path) => {
    const active = location.pathname === path || location.pathname.startsWith(path + '/');
    if (path === '/profile') {
      console.log(`🔍 Checking /profile - pathname: ${location.pathname}, active: ${active}`);
    }
    return active;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixed */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-eco-main p-2 rounded-lg">
              <Leaf className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-eco-dark">EcoLoop</h1>
              <p className="text-xs text-gray-500">
                {user?.role === 'NGO' ? 'NGO Portal' : 
                 user?.role === 'RECYCLER' ? 'Recycler Portal' : 
                 'Household Portal'}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  console.log(`🔗 Navigating to: ${item.path}`);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-eco-main text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section - Bottom */}
        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-eco-main rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
        <FloatingChatbotButton />
      </main>
    </div>
  );
};

export default Layout;