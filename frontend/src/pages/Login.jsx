// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, authLoading, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!form.email || !form.password) return setLocalError('Email and password required');
    const res = await login(form);
    if (res.success) navigate('/dashboard');
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <h2>Welcome back</h2>
        <div className="small-muted">Log in to your EcoLoop account</div>

        <div style={{ marginTop: 12 }}>
          {localError && <div className="error">{localError}</div>}
          {error && <div className="error">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="form-row">
              <label className="label">Email</label>
              <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="label">Password</label>
              <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="submit" className="btn-primary" disabled={authLoading}>{authLoading ? 'Signing in…' : 'Sign in'}</button>
              <a className="btn-ghost" href="/signup">Create account</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
