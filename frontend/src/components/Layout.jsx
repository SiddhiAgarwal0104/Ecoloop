import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },

  
  { path: '/community/requests', label: 'Community Sharing', icon: '🤝' },

  { path: '/donations', label: 'My Donations', icon: '🎁' },
  { path: '/donations/create', label: 'Create Donation', icon: '➕' },
  { path: '/recycles', label: 'My Recycles', icon: '♻️' },
  { path: '/recycles/create', label: 'Create Recycle', icon: '➕' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];



  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 bg-white shadow-lg`}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">EcoLoop</h1>
          <p className="text-xs text-gray-500 mt-1">Household Management</p>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-6 py-3 transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Floating Logout Button - Bottom Right */}
        <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 50 }}>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors text-xs font-semibold"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              ☰
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {navItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              <Link to="/notifications" className="relative text-gray-600 hover:text-gray-900">
                🔔
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </main>
    </div>
  )
}

export default Layout