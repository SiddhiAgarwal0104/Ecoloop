// src/pages/Notifications.jsx
import React, { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationsContext';
import MainLayout from '../components/Layout/MainLayout';

export default function Notifications(){
  const { notifications, loading, error, fetchNotifications, markAsRead } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <MainLayout>
      <div className="container">
        <div className="card">
          <h2>Notifications</h2>
          <div className="small-muted">Recent messages and updates.</div>

          <div style={{ marginTop: 12 }}>
            {loading && <div className="small-muted">Loading…</div>}
            {error && <div className="error">{error}</div>}
            {!loading && !error && (
              <div style={{ display: 'grid', gap: 10 }}>
                {notifications.length === 0 && <div className="small-muted">No notifications</div>}
                {notifications.map((n) => (
                  <div key={n._id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{n.title}</div>
                        <div className="small-muted">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {!n.isRead && <span style={{ color: 'var(--eco-green)', fontWeight: 700 }}>●</span>}
                        {!n.isRead && <button className="btn-ghost" onClick={()=>markAsRead(n._id)}>Mark read</button>}
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>{n.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
