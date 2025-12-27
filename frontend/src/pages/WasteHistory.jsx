// src/pages/WasteHistory.jsx
import React, { useEffect, useState } from 'react';
import { useWaste } from '../contexts/WasteContext';
import WasteList from '../components/WasteList';
import MainLayout from '../components/Layout/MainLayout';

export default function WasteHistory(){
  const { logs, loading, error, fetchHistory } = useWaste();
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchHistory(filters);
  }, [fetchHistory]);

  return (
    <MainLayout>
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>Waste History</h2>
              <div className="small-muted">Your past waste logs and stats.</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            {loading && <div className="small-muted">Loading…</div>}
            {error && <div className="error">{error}</div>}
            {!loading && !error && <WasteList logs={logs} />}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
