import React, { useState } from 'react';
import { useLend } from '../../contexts/LendContext';
import { useNavigate } from 'react-router-dom';

export default function DonateForm(){
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('general');
  const [condition, setCondition] = useState('good');
  const [availability, setAvailability] = useState('donation');
  const { createDonate, loading, error } = useLend();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const res = await createDonate({ itemName, category, condition, availability });
    if (res.success) navigate('/dashboard');
  };

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <h2>Donate an item</h2>
      <form onSubmit={submit} style={{ marginTop: 12 }}>
        <label>
          Item name
          <input value={itemName} onChange={(e)=>setItemName(e.target.value)} required />
        </label>
        <label>
          Category
          <input value={category} onChange={(e)=>setCategory(e.target.value)} />
        </label>
        <label>
          Condition
          <select value={condition} onChange={(e)=>setCondition(e.target.value)}>
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </label>
        <label>
          Notes (optional)
          <input placeholder="Availability, pickup details" value={availability} onChange={(e)=>setAvailability(e.target.value)} />
        </label>

        {error && <div className="error">{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Submitting…' : 'Donate item'}</button>
        </div>
      </form>
    </div>
  );
}