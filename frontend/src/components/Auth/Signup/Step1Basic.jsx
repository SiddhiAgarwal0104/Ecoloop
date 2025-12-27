import React, { useState } from 'react';

export default function Step1Basic({ initial = {}, onNext }) {
  const [name, setName] = useState(initial.name || '');
  const [email, setEmail] = useState(initial.email || '');
  const [password, setPassword] = useState(initial.password || '');

  const handleNext = (e) => {
    e.preventDefault();
    onNext({ name, email, password });
  };

  return (
    <form onSubmit={handleNext} className="step-form">
      <label>
        Full name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label>
        Email or phone
        <input type="text" placeholder="email or phone" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>

      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
      </label>

      <div className="actions">
        <button type="submit" className="btn btn-primary">Next</button>
      </div>
    </form>
  );
}
