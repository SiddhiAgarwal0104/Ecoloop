import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/analytics')
      .then(res => setData(res.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

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
              <div className="metric-value">{loading ? '…' : (data?.totalWeightKg || 0)} <span className="metric-unit">kg</span></div>
            </div>
          </div>
          <div className="metric-sub small-muted">Across platform</div>
        </div>

        <div className="metric-card card">
          <div className="metric-card-header">
            <div className="metric-icon bg-green">🌿</div>
            <div>
              <div className="metric-title">CO₂ Saved</div>
              <div className="metric-value">{loading ? '…' : (data?.totalCO2 || 0)} <span className="metric-unit">kg</span></div>
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
              <div className="metric-value">{data?.category?.length || 0}</div>
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
          <pre style={{marginTop:8}}>{JSON.stringify(data?.monthly || {}, null, 2)}</pre>
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
