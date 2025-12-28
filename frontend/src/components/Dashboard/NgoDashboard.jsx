import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function NgoDashboard() {
  const [pending, setPending] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/requests/pending').catch(() => ({ data: { data: [] } })),
      api.get('/lend/matched').catch(() => ({ data: { data: [] } }))
    ]).then(([reqRes, itemRes]) => {
      setPending(reqRes.data.count || 0);
      setItems(itemRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard container">
      <div className="header-row">
        <div>
          <h1>NGO Dashboard</h1>
          <div className="small-muted">Incoming requests and matched reusable items in your locality</div>
        </div>
      </div>

      <div className="card-grid">
        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">📬</div>
            <div>
              <div className="metric-title">Pending Requests</div>
              <div className="metric-value">{loading ? '…' : pending}</div>
            </div>
          </div>
          <div className="metric-sub small-muted"><Link to="/notifications" className="link">View all →</Link></div>
        </div>
        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">📍</div>
            <div>
              <div className="metric-title">Matched Items</div>
              <div className="metric-value">{loading ? '…' : items.length}</div>
            </div>
          </div>
          <div className="metric-sub small-muted">In your locality</div>
        </div>
        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">🌿</div>
            <div>
              <div className="metric-title">Items Collected</div>
              <div className="metric-value">0</div>
            </div>
          </div>
          <div className="metric-sub small-muted">This month</div>
        </div>
        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">⚡</div>
            <div>
              <div className="metric-title">Impact</div>
              <div className="metric-value">0 <span className="metric-unit">kg</span></div>
            </div>
          </div>
          <div className="metric-sub small-muted">CO₂ saved</div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Matched items in your locality</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {items.slice(0, 5).map(item => (
              <div key={item._id} className="card" style={{ padding: 12, backgroundColor: '#f5faf4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                    <div className="small-muted">{item.category} • Condition: {item.condition}</div>
                    <div className="small-muted" style={{ marginTop: 4 }}>Owner: {item.owner.name}</div>
                  </div>
                  <Link to={`/requests/new?itemId=${item._id}`} className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>Request</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3>Actions</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="btn-primary" to="/notifications">View Requests</Link>
          <Link className="btn-ghost" to="/profile">Manage Profile</Link>
        </div>
      </div>
    </div>
  );
}
