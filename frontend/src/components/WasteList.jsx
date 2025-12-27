// src/components/WasteList.jsx
import React from 'react';

export default function WasteList({ logs = [] }) {
  if (!logs.length) return <div className="small-muted">No waste logs yet — start by logging your first entry.</div>;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {logs.map((l) => (
        <div key={l._id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{l.category}</div>
              <div className="small-muted">{new Date(l.wasteDate).toLocaleDateString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800 }}>{l.quantity?.value ?? '—'} {l.quantity?.unit ?? ''}</div>
              <div className="small-muted">CO₂: {l.impact?.co2SavedKg ?? 0} kg</div>
            </div>
          </div>
          {l.notes && <div style={{ marginTop: 8 }}>{l.notes}</div>}
        </div>
      ))}
    </div>
  );
}
