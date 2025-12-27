// src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import HouseholdDashboard from '../components/Dashboard/HouseholdDashboard';
import NgoDashboard from '../components/Dashboard/NgoDashboard';
import RecyclerDashboard from '../components/Dashboard/RecyclerDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role;

  const renderByRole = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'ngo':
        return <NgoDashboard />;
      case 'recycler':
        return <RecyclerDashboard />;
      case 'household':
      default:
        return <HouseholdDashboard />;
    }
  };

  return (
    <MainLayout>
      {renderByRole()}
    </MainLayout>
  );
}
