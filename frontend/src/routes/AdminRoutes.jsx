import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/admin/Dashboard';
import Profile from '../pages/admin/Profile';
import LocalityAnalytics from '../pages/admin/LocalityAnalytics';
import SustainabilityImpact from '../pages/admin/SustainabilityImpact';
import PartnerMonitoring from '../pages/admin/PartnerMonitoring';
import Reports from '../pages/admin/Reports';
import CompleteProfile from '../pages/admin/CompleteProfile';

/**
 * Admin Routes Component
 * Defines all routes for the admin module
 */
const AdminRoutes = () => {
  return (
    <Routes>
      {/* Profile Completion */}
      <Route path="complete-profile" element={<CompleteProfile />} />

      {/* Profile */}
      <Route path="profile" element={<Profile />} />

      {/* Dashboard */}
      <Route path="dashboard" element={<Dashboard />} />

      {/* Locality Analytics */}
      <Route path="localities" element={<LocalityAnalytics />} />

      {/* Sustainability Impact */}
      <Route path="sustainability" element={<SustainabilityImpact />} />

      {/* Partner Monitoring (NGO & Recycler) */}
      <Route path="partners" element={<PartnerMonitoring />} />

      {/* Legacy routes - redirect to partners */}
      <Route path="ngos" element={<Navigate to="/admin/partners" replace />} />
      <Route path="recyclers" element={<Navigate to="/admin/partners" replace />} />

      {/* Reports */}
      <Route path="reports" element={<Reports />} />

      {/* Default redirect to dashboard */}
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;