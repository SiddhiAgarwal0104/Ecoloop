import React from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">EcoLoop</h1>
          <p className="text-xs text-gray-500">Household Management</p>
        </div>

        <nav className="mt-6">
          {[
            ['/dashboard', 'Dashboard'],
            ['/donations', 'My Donations'],
            ['/donations/create', 'Create Donation'],
            ['/recycles', 'My Recycles'],
            ['/recycles/create', 'Create Recycle'],
            ['/notifications', 'Notifications'],
            ['/profile', 'Profile'],
          ].map(([path, label]) => (
            <Link
              key={path}
              to={path}
              className={`block px-6 py-3 ${
                isActive(path)
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-gray-500 mb-2">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
