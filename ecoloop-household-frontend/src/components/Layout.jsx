// import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import FloatingChatbotButton from './FloatingChatbotButton';
// import { 
//   Home, 
//   Heart, 
//   Recycle, 
//   PlusCircle, 
//   Bell, 
//   User, 
//   LogOut,
//   Package,
//   Clock,
//   CheckCircle,
//   Leaf,
//   Award,
//   Trophy
// } from 'lucide-react';

// const Layout = () => {
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   // Role-based navigation items
//   const getNavigationItems = () => {
//     if (user?.role === 'NGO') {
//       return [
//         { path: '/ngo/dashboard', icon: Home, label: 'Dashboard' },
//         { path: '/ngo/donations/available', icon: Package, label: 'Available Donations' },
//         { path: '/ngo/donations/accepted', icon: Clock, label: 'Accepted Donations' },
//         { path: '/notifications', icon: Bell, label: 'Notifications' },
//         { path: '/profile', icon: User, label: 'Profile' },
//       ];
//     } else if (user?.role === 'RECYCLER') {
//       return [
//         { path: '/recycler/dashboard', icon: Home, label: 'Dashboard' },
//         { path: '/recycler/requests/available', icon: Recycle, label: 'Available Requests' },
//         { path: '/recycler/requests/accepted', icon: Clock, label: 'Accepted Requests' },
//         { path: '/notifications', icon: Bell, label: 'Notifications' },
//         { path: '/profile', icon: User, label: 'Profile' },
//       ];
//     } else {
//       // HOUSEHOLD
//       return [
//         { path: '/dashboard', icon: Home, label: 'Dashboard' },
//         { path: '/donations', icon: Heart, label: 'My Donations' },
//         { path: '/donations/create', icon: PlusCircle, label: 'Create Donation' },
//         { path: '/recycles', icon: Recycle, label: 'My Recycles' },
//         { path: '/recycles/create', icon: PlusCircle, label: 'Create Recycle' },
//         { path: '/badges', icon: Award, label: 'Badges' },
//         { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
//         { path: '/notifications', icon: Bell, label: 'Notifications' },
//         { path: '/chat', icon: Leaf, label: 'AI Waste Coach' },
//         { path: '/profile', icon: User, label: 'Profile' },
//       ];
//     }
//   };

//   const navigationItems = getNavigationItems();

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Sidebar */}
//       <aside className="w-64 bg-white shadow-lg fixed h-full">
//         <div className="p-6 border-b">
//           <Link to="/" className="flex items-center gap-2">
//             <div className="bg-eco-main p-2 rounded-lg">
//               <Leaf className="text-white" size={24} />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-eco-dark">EcoLoop</h1>
//               <p className="text-xs text-gray-500">
//                 {user?.role === 'NGO' ? 'NGO Management' : 
//                  user?.role === 'RECYCLER' ? 'Recycler Management' : 
//                  'Household Management'}
//               </p>
//             </div>
//           </Link>
//         </div>

//         <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
//           {navigationItems.map((item) => {
//             const Icon = item.icon;
//             return (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
//                   isActive(item.path)
//                     ? 'bg-eco-main text-white shadow-md'
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <Icon size={20} />
//                 <span className="font-medium">{item.label}</span>
//               </Link>
//             );
//           })}
//         </nav>

//         {/* User Profile Section */}
//         <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
//           <div className="flex items-center gap-3 mb-3">
//             <div className="w-10 h-10 bg-eco-main rounded-full flex items-center justify-center">
//               <span className="text-white font-bold">
//                 {user?.name?.charAt(0).toUpperCase()}
//               </span>
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
//               <p className="text-xs text-gray-500 truncate">{user?.email}</p>
//             </div>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//           >
//             <LogOut size={18} />
//             <span className="font-medium">Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 ml-64">
//         <div className="p-8">
//           <Outlet />
//         </div>
//         <FloatingChatbotButton />
//       </main>
//     </div>
//   );
// };

// export default Layout;


import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingChatbotButton from './FloatingChatbotButton';
import {
  Home,
  Heart,
  Recycle,
  PlusCircle,
  Bell,
  User,
  LogOut,
  Package,
  Clock,
  Leaf,
  Award,
  Trophy
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide layout on auth pages
  if (['/login', '/register'].includes(location.pathname)) {
    return <Outlet />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navByRole = {
    NGO: [
      { path: '/ngo/dashboard', icon: Home, label: 'Dashboard' },
      { path: '/ngo/donations/available', icon: Package, label: 'Available Donations' },
      { path: '/ngo/donations/accepted', icon: Clock, label: 'Accepted Donations' },
      { path: '/notifications', icon: Bell, label: 'Notifications' },
      { path: '/profile', icon: User, label: 'Profile' }
    ],
    RECYCLER: [
      { path: '/recycler/dashboard', icon: Home, label: 'Dashboard' },
      { path: '/recycler/requests/available', icon: Recycle, label: 'Available Requests' },
      { path: '/recycler/requests/accepted', icon: Clock, label: 'Accepted Requests' },
      { path: '/notifications', icon: Bell, label: 'Notifications' },
      { path: '/profile', icon: User, label: 'Profile' }
    ],
    HOUSEHOLD: [
      { path: '/dashboard', icon: Home, label: 'Dashboard' },
      { path: '/donations', icon: Heart, label: 'My Donations' },
      { path: '/donations/create', icon: PlusCircle, label: 'Create Donation' },
      { path: '/recycles', icon: Recycle, label: 'My Recycles' },
      { path: '/recycles/create', icon: PlusCircle, label: 'Create Recycle' },
      { path: '/badges', icon: Award, label: 'Badges' },
      { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
      { path: '/notifications', icon: Bell, label: 'Notifications' },
      { path: '/chat', icon: Leaf, label: 'AI Waste Coach' },
      { path: '/profile', icon: User, label: 'Profile' }
    ]
  };

  const navigationItems = navByRole[user?.role] || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-full">
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-eco-main p-2 rounded-lg">
              <Leaf className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-eco-dark">EcoLoop</h1>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {navigationItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                location.pathname === path
                  ? 'bg-eco-main text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <p className="font-semibold">{user?.name}</p>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
        <FloatingChatbotButton />
      </main>
    </div>
  );
};

export default Layout;
