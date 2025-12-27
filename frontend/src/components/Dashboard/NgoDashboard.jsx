import React from 'react';
import { Link } from 'react-router-dom';

export default function NgoDashboard() {
  return (
    <div className="dashboard container">
      <div className="header-row">
        <div>
          <h1>NGO Dashboard</h1>
          <div className="small-muted">Requests, items processed, and impact</div>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>Requests received</h3>
          <div className="metric">—</div>
          <div className="small-muted">Pending</div>
        </div>
        <div className="card">
          <h3>Items processed</h3>
          <div className="metric">—</div>
          <div className="small-muted">This month</div>
        </div>
        <div className="card">
          <h3>Impact</h3>
          <div className="metric">— kg CO2</div>
          <div className="small-muted">Estimated</div>
        </div>
        <div className="card">
          <h3>Local actions</h3>
          <div className="metric">—</div>
          <div className="small-muted">Active programs</div>
        </div>
      </div>

      <div className="card">
        <h3>Actions</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn-primary" to="/notifications">View Requests</Link>
          <Link className="btn-ghost" to="/profile">Manage Profile</Link>
        </div>
      </div>
    </div>
  );
}
