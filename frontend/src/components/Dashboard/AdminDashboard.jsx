import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="dashboard container">
      <div className="header-row">
        <div>
          <h1>Admin Dashboard</h1>
          <div className="small-muted">System-wide analytics and oversight</div>
        </div>
      </div>

      <div className="card-grid">
        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">🗑️</div>
            <div>
              <div className="metric-title">Waste Collected</div>
              <div className="metric-value">— <span className="metric-unit">kg</span></div>
            </div>
          </div>
          <div className="metric-sub small-muted">Across platform</div>
        </div>

        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">🌿</div>
            <div>
              <div className="metric-title">CO₂ Saved</div>
              <div className="metric-value">— <span className="metric-unit">kg</span></div>
            </div>
          </div>
          <div className="metric-sub small-muted">Estimated</div>
        </div>

        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">⚡</div>
            <div>
              <div className="metric-title">Energy Saved</div>
              <div className="metric-value">— <span className="metric-unit">kWh</span></div>
            </div>
          </div>
          <div className="metric-sub small-muted">Estimated</div>
        </div>

        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">📍</div>
            <div>
              <div className="metric-title">Active Localities</div>
              <div className="metric-value">—</div>
            </div>
          </div>
          <div className="metric-sub small-muted">Monitored</div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="card-grid">
        <div className="card">
          <h4>Locality analytics</h4>
          <div className="small-muted">View per-locality trends and performance</div>
        </div>
        <div className="card">
          <h4>NGO monitoring</h4>
          <div className="small-muted">Track NGO activity and approvals</div>
        </div>
        <div className="card">
          <h4>Recycler monitoring</h4>
          <div className="small-muted">Recycler throughput and compliance</div>
        </div>
        <div className="card">
          <h4>Reports</h4>
          <div className="small-muted">Export reports and audits</div>
        </div>
      </div>
    </div>
  );
} 
