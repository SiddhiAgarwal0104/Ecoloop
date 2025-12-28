import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function HouseholdDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/waste/dashboard')
      .then(res => setData(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const userStats = data?.userStats || {};
  const recentLogs = data?.recentLogs || [];

  return (
    <div className="dashboard container">
      <div className="header-row">
        <div>
          <h1>Household Dashboard</h1>
          <div className="small-muted">Track your sustainability impact and share items</div>
        </div>
      </div>

      <div className="card-grid">
        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">🗑️</div>
            <div>
              <div className="metric-title">Total Waste Logged</div>
              <div className="metric-value">{loading ? '…' : (userStats.totalWeightKg || 0)} <span className="metric-unit">kg</span></div>
            </div>
          </div>
          <div className="metric-sub small-muted">{userStats.count || 0} logs</div>
        </div>

        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">🌿</div>
            <div>
              <div className="metric-title">CO₂ Saved</div>
              <div className="metric-value">{loading ? '…' : (userStats.totalCO2 || 0).toFixed(2)} <span className="metric-unit">kg</span></div>
            </div>
          </div>
          <div className="metric-sub small-muted">Estimated impact</div>
        </div>

        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">⚡</div>
            <div>
              <div className="metric-title">Energy Saved</div>
              <div className="metric-value">{loading ? '…' : (userStats.totalEnergy || 0).toFixed(2)} <span className="metric-unit">kWh</span></div>
            </div>
          </div>
          <div className="metric-sub small-muted">Equivalent</div>
        </div>

        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">🔁</div>
            <div>
              <div className="metric-title">Reusable Items</div>
              <div className="metric-value">{loading ? '…' : (data?.communityStats?.count || 0)}</div>
            </div>
          </div>
          <div className="metric-sub small-muted">In your locality</div>
        </div>
      </div>

      <div className="card">
        <h3>Quick actions</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="btn-primary" to="/waste/log">Log Waste</Link>
          <Link className="btn-ghost" to="/waste/history">View History</Link>
          <Link className="btn-ghost" to="/lend">Lend Item</Link>
          <Link className="btn-ghost" to="/donate">Donate Item</Link>
        </div>
      </div>

      {recentLogs.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Recent waste logs</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {recentLogs.map(log => (
              <div key={log._id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #eee' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{log.category}</div>
                  <div className="small-muted">{new Date(log.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>{log.quantity.value} {log.quantity.unit}</div>
                  <div className="small-muted">CO₂: {log.impact.co2SavedKg.toFixed(2)}kg</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
