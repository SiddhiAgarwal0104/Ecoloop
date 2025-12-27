import React from 'react';
import { Link } from 'react-router-dom';

export default function HouseholdDashboard() {
  return (
    <div className="dashboard container">
      <div className="header-row">
        <div>
          <h1>Household Dashboard</h1>
          <div className="small-muted">A simplified view tailored for households</div>
        </div>
      </div>

      <div className="card-grid">
        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">🗑️</div>
            <div>
              <div className="metric-title">Total Waste Logged</div>
              <div className="metric-value">— <span className="metric-unit">kg</span></div>
            </div>
          </div>
          <div className="metric-sub small-muted">Total logged</div>
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
            <div className="metric-icon bg-green">🔁</div>
            <div>
              <div className="metric-title">Items Lended</div>
              <div className="metric-value">—</div>
            </div>
          </div>
          <div className="metric-sub small-muted">Active lends</div>
        </div>

        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">🎁</div>
            <div>
              <div className="metric-title">Donations</div>
              <div className="metric-value">—</div>
            </div>
          </div>
          <div className="metric-sub small-muted">Completed</div>
        </div>
      </div>

      <div className="card">
        <h3>Quick actions</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn-primary" to="/waste/log">Log Waste</Link>
          <Link className="btn-ghost" to="/waste/history">View Waste History</Link>
          <Link className="btn-ghost" to="/lend">Lend Item</Link>
          <Link className="btn-ghost" to="/donate">Donate Item</Link>
        </div>
      </div>
    </div>
  );
} 
