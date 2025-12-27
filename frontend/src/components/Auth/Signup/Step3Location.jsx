import React, { useState } from 'react';

export default function Step3Location({ initial = {}, onBack, onSubmit }) {
  const [address, setAddress] = useState(initial.location?.address || '');
  const [city, setCity] = useState(initial.location?.city || '');
  const [state, setState] = useState(initial.location?.state || '');
  const [postal, setPostal] = useState(initial.location?.postal || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ location: { address, city, state, postal } });
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <label>
        Address
        <input value={address} onChange={(e) => setAddress(e.target.value)} required />
      </label>

      <label>
        City
        <input value={city} onChange={(e) => setCity(e.target.value)} required />
      </label>

      <label>
        State / Province
        <input value={state} onChange={(e) => setState(e.target.value)} required />
      </label>

      <label>
        Postal Code
        <input value={postal} onChange={(e) => setPostal(e.target.value)} required />
      </label>

      <div className="actions">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        <button type="submit" className="btn btn-primary">Complete Sign up</button>
      </div>
    </form>
  );
}
