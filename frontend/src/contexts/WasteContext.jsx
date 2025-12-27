// src/contexts/WasteContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const WasteContext = createContext(null);

export function WasteProvider({ children }) {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Example filters: { startDate, endDate, category }
      const res = await api.get('/waste/history', { params: filters });
      const data = res.data.logs || res.data.data || res.data || [];
      setLogs(Array.isArray(data) ? data : []);
      setStats(res.data.stats || null);
      setLoading(false);
      return { success: true, data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch waste history';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  }, []);

  const logWaste = useCallback(async ({ category, quantityValue, quantityUnit = 'kg', wasteDate, notes, image, aiPrediction }) => {
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('category', category);
      form.append('quantity[value]', quantityValue);
      form.append('quantity[unit]', quantityUnit);
      if (wasteDate) form.append('wasteDate', wasteDate);
      if (notes) form.append('notes', notes);
      if (aiPrediction) form.append('aiPrediction', JSON.stringify(aiPrediction));
      if (image) form.append('image', image);

      const res = await api.post('/waste/log', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // append to logs (if API returns created record)
      const created = res.data.data || res.data;
      setLogs((prev) => (created ? [created, ...prev] : prev));
      setLoading(false);
      return { success: true, data: created };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to log waste';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  }, []);

  const getDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/waste/dashboard');
      setLoading(false);
      return { success: true, data: res.data.data };
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard');
      setLoading(false);
      return { success: false, error };
    }
  }, []);

  return (
    <WasteContext.Provider value={{ logs, stats, loading, error, fetchHistory, logWaste, getDashboard }}>
      {children}
    </WasteContext.Provider>
  );
}

export function useWaste() {
  const ctx = useContext(WasteContext);
  if (!ctx) throw new Error('useWaste must be used within WasteProvider');
  return ctx;
}
