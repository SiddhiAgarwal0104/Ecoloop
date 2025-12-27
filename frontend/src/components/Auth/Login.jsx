import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await login({ email, password });
    if (res && res.success === false) {
      setError(res.error || 'Login failed');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="login-card card">
      <h2>Welcome back to EcoLoop</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email or phone
          <input value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email or phone" />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <div className="form-error">{error}</div>}
        <div className="actions">
          <button type="submit" className="btn btn-primary">Sign in</button>
        </div>
      </form>
    </div>
  );
}
