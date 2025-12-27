import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-placeholder">🌿</div>
        <div className="brand-text">EcoLoop</div>
      </div>

      <nav className="nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon" aria-hidden="true">🏠</span>Dashboard
        </NavLink>
        <NavLink to="/waste/log" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon" aria-hidden="true">🗑️</span>Log Waste
        </NavLink>
        <NavLink to="/waste/history" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon" aria-hidden="true">📜</span>Waste History
        </NavLink>
        <NavLink to="/lend" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon" aria-hidden="true">🔁</span>Lend Item
        </NavLink>
        <NavLink to="/donate" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon" aria-hidden="true">🎁</span>Donate Item
        </NavLink>
        <NavLink to="/notifications" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon" aria-hidden="true">🔔</span>Notifications
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon" aria-hidden="true">👤</span>Profile
        </NavLink>

        {role === 'admin' && (
          <>
            <div className="nav-section">Admin</div>
            <NavLink to="/admin/localities" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon" aria-hidden="true">📍</span>Localities
            </NavLink>
            <NavLink to="/admin/ngos" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon" aria-hidden="true">🤝</span>NGOs
            </NavLink>
            <NavLink to="/admin/recyclers" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon" aria-hidden="true">🔧</span>Recyclers
            </NavLink>
            <NavLink to="/admin/reports" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon" aria-hidden="true">📊</span>Reports
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer small-muted">Role: {role}</div>
    </aside>
  );
}
