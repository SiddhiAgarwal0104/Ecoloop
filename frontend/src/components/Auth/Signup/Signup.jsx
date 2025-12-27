import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Step1Basic from './Step1Basic';
import Step2Role from './Step2Role';
import Step3Location from './Step3Location';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'household',
    roleDetails: {},
    location: {},
  });

  const { register, error } = useAuth();
  const navigate = useNavigate();

  const next = (patch = {}) => {
    setForm((f) => ({ ...f, ...patch }));
    setStep((s) => Math.min(3, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (patch = {}) => {
    const payload = { ...form, ...patch };
    try {
      const res = await register(payload);
      if (res.success !== false) {
        // redirect to dashboard (server /me should provide role)
        navigate('/dashboard');
      }
    } catch (err) {
      // register will surface errors through context; keep simple here
      console.error(err);
    }
  };

  return (
    <div className="signup-container card">
      <div className="signup-header">
        <h2>Sign up to EcoLoop</h2>
        <p>Step {step} of 3</p>
      </div>

      <div className="signup-step">
        {error && <div className="form-error">{error}</div>}
        {step === 1 && (
          <Step1Basic
            initial={form}
            onNext={(patch) => next(patch)}
          />
        )}
        {step === 2 && (
          <Step2Role
            initial={form}
            onNext={(patch) => next(patch)}
            onBack={back}
            setForm={setForm}
          />
        )}
        {step === 3 && (
          <Step3Location
            initial={form}
            onBack={back}
            onSubmit={(patch) => handleSubmit(patch)}
          />
        )}
      </div>
    </div>
  );
}
