// src/pages/Profile.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/Layout/MainLayout';

export default function Profile(){
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [status, setStatus] = useState(null);

  const save = async (e) =>{
    e.preventDefault();
    setStatus('saving');
    const res = await updateProfile(form);
    setStatus(res.success ? 'saved' : 'error');
  }

  return (
    <MainLayout>
      <div className="container">
        <div className="card" style={{ maxWidth: 700 }}>
          <h2>Profile</h2>
          <div className="small-muted">Manage account details</div>

          <form onSubmit={save} style={{ marginTop: 12 }}>
            <div className="form-row">
              <label className="label">Full name</label>
              <input className="input" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
            </div>

            <div className="form-row">
              <label className="label">Email</label>
              <input className="input" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-primary" type="submit">Save</button>
              {status === 'saving' && <div className="small-muted">Saving…</div>}
              {status === 'saved' && <div className="small-muted">Saved ✓</div>}
              {status === 'error' && <div className="error">Failed to save</div>}
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}
