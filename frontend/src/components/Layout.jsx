import React from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { Leaf, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname.startsWith(path)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/donations', label: 'My Donations' },
    { path: '/donations/create', label: 'Create Donation' },
    { path: '/recycles', label: 'My Recycles' },
    { path: '/recycles/create', label: 'Create Recycle' },
    { path: '/notifications', label: 'Notifications' },
    { path: '/profile', label: 'Profile' },
  ]

  return (
    <div className="flex h-screen bg-eco-light">
      {/* Navbar */}
      <header className="navbar fixed top-0 left-0 right-0">
        <div className="navbar-container">
          <div className="navbar-logo">
            <div className="navbar-logo-icon">
              <Leaf className="text-white" size={28} />
            </div>
            <div className="navbar-logo-text">
              <h1 className="navbar-logo-title">ECOLOOP</h1>
              <p className="navbar-logo-subtitle">Household</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium text-eco-dark">{user?.name}</p>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="sidebar">
        <nav className="sidebar-nav">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${
                isActive(path)
                  ? 'nav-link-active'
                  : 'nav-link-inactive'
              }`}
            >
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 w-64">
          <button
            onClick={handleLogout}
            className="btn btn-danger w-full justify-center"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content overflow-y-auto">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
