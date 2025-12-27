import React, { useState } from 'react';

export default function Step2Role({ initial = {}, onNext, onBack }) {
  const [role, setRole] = useState(initial.role || 'household');
  const [orgName, setOrgName] = useState(initial.roleDetails?.orgName || '');
  const [regId, setRegId] = useState(initial.roleDetails?.regId || '');
  const [adminCode, setAdminCode] = useState(initial.roleDetails?.adminCode || '');

  const handleNext = (e) => {
    e.preventDefault();
    const roleDetails = {};
    if (role === 'ngo' || role === 'recycler') {
      roleDetails.orgName = orgName;
      roleDetails.regId = regId;
    }
    if (role === 'admin') roleDetails.adminCode = adminCode;
    onNext({ role, roleDetails });
  };

  return (
    <form onSubmit={handleNext} className="step-form">
      <label>
        Select role
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="household">Household</option>
          <option value="ngo">NGO</option>
          <option value="recycler">Recycler</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      {(role === 'ngo' || role === 'recycler') && (
        <>
          <label>
            Organization name
            <input value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
          </label>
          <label>
            Registration / License ID
            <input value={regId} onChange={(e) => setRegId(e.target.value)} required />
          </label>
        </>
      )}

      {role === 'admin' && (
        <label>
          Admin code
          <input value={adminCode} onChange={(e) => setAdminCode(e.target.value)} required />
        </label>
      )}

      <div className="actions">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        <button type="submit" className="btn btn-primary">Next</button>
      </div>
    </form>
  );
}
