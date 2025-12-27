// src/pages/WasteLog.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWaste } from '../contexts/WasteContext';
import MainLayout from '../components/Layout/MainLayout';

export default function WasteLog(){
  const navigate = useNavigate();
  const { logWaste, loading, error } = useWaste();
  const [form, setForm] = useState({ category: 'plastic', quantity: 1, unit: 'kg', notes: '' });
  const [image, setImage] = useState(null);
  const [localError, setLocalError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!form.quantity || form.quantity <= 0) return setLocalError('Please enter a positive quantity');

    const res = await logWaste({ category: form.category, quantityValue: form.quantity, quantityUnit: form.unit, notes: form.notes, image });
    if (res.success) {
      navigate('/waste/history');
    }
  };

  return (
    <MainLayout>
      <div className="page">
        <div className="container">
          <div className="card" style={{ maxWidth: 700 }}>
            <h2>Log Waste</h2>
            <div className="small-muted">Submit a waste entry to help track your impact.</div>

            <form onSubmit={submit} style={{ marginTop: 12 }}>
              {localError && <div className="error">{localError}</div>}
              {error && <div className="error">{error}</div>}

              <div className="form-row">
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})}>
                  <option value="plastic">Plastic</option>
                  <option value="paper">Paper</option>
                  <option value="metal">Metal</option>
                  <option value="glass">Glass</option>
                  <option value="electronic">Electronic</option>
                  <option value="wet">Wet</option>
                  <option value="dry">Dry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-row">
                <label className="label">Quantity</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" type="number" min="0" step="0.01" value={form.quantity} onChange={(e)=>setForm({...form, quantity: Number(e.target.value)})} />
                  <select className="input" value={form.unit} onChange={(e)=>setForm({...form, unit: e.target.value})} style={{ width: 120 }}>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <label className="label">Notes (optional)</label>
                <input className="input" value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} />
              </div>

              <div className="form-row">
                <label className="label">Image (optional)</label>
                <input type="file" accept="image/*" onChange={(e)=>setImage(e.target.files[0])} />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Logging…' : 'Log waste'}</button>
                <button type="button" className="btn-ghost" onClick={()=>navigate('/dashboard')}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
