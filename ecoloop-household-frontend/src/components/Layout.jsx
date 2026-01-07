import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * Main Layout Component
 * Provides consistent layout structure for all pages
 * Includes navbar, sidebar, and content area
 */
const Layout = () => {
  const location = useLocation();
  const isAuthPage = ['login', 'register'].some(path => location.pathname.includes(path));

  // Don't show layout on auth pages
  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-eco-light">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="main-content overflow-y-auto">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
