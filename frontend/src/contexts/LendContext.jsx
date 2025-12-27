import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../api/axios';

const LendContext = createContext(null);
export const useLend = () => useContext(LendContext);

export function LendProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createLend = async ({ itemName, category, condition, availability, quantity = 1, description = '' }) => {
    setLoading(true);
    setError(null);
    try {
      // Map frontend fields to backend expected payload
      const payload = {
        title: itemName,
        description,
        category,
        condition,
        quantity,
        listingType: 'lend',
        availability
      };
      const res = await api.post('/lend/create', payload);
      setLoading(false);
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create lend';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  const createDonate = async ({ itemName, category, condition, availability, quantity = 1, description = '' }) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: itemName,
        description,
        category,
        condition,
        quantity,
        listingType: 'donate',
        availability
      };
      // Reuse the same backend create route for donations
      const res = await api.post('/lend/create', payload);
      setLoading(false);
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create donation';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  return (
    <LendContext.Provider value={{ loading, error, createLend, createDonate }}>
      {children}
    </LendContext.Provider>
  );
}

LendProvider.propTypes = { children: PropTypes.node };

export default LendContext;