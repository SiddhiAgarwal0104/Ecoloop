import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { notifications = [], fetchNotifications } = useNotifications();

  React.useEffect(() => {
    fetchNotifications(true).catch(() => {});
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo-leaf" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C12 2 7 6 4 10c-1.5 2.5-1 6 1 8s5 2 7 1c2-1 6-6 6-6s-3-6-6-11z" fill="white" />
          </svg>
        </div>
        <div className="brand-text">
          <div className="app-name">EcoLoop</div>
          <div className="app-tag">Sustainability & Community</div>
        </div>
      </div>

      <div className="topbar-actions">
        <div style={{ marginRight: 12 }}>
          <a href="/notifications" className="nav-item" title="Notifications">
            <span className="nav-icon">🔔</span>
            {unreadCount > 0 && <span style={{ fontSize: 12, marginLeft: 6, color: 'var(--eco-dark)', fontWeight: 700 }}>{unreadCount}</span>}
          </a>
        </div>

        <div className="user-info">
          <div className="user-name">{user?.name || user?.email}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <div className="avatar" title={user?.name || user?.email}>
          {user?.name ? user.name[0].toUpperCase() : 'U'}
        </div>
        <button className="btn-ghost" onClick={logout}>Sign out</button>
      </div>
    </header>
  );
} 
