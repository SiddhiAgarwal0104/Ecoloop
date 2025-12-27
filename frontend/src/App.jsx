import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/admin/Header';
import Sidebar from './components/admin/Sidebar';
import AdminRoutes from './routes/AdminRoutes';
import ProtectedRoute from './routes/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout wrapper for admin pages
const AdminLayout = ({ children }) => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-eco-light">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-[calc(100vh-73px)]">
            {children}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes - Protected */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminRoutes />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Root redirect to admin dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* 404 - Not Found */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen bg-eco-light">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-eco-main mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-6">Page not found</p>
                <a href="/admin/dashboard" className="btn-primary inline-block">
                  Go to Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;