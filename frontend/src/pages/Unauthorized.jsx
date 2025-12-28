import React from 'react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ecoloop-green-light">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-ecoloop-green mb-4">Access Denied</h2>
        <p>You do not have permission to view this page. Please contact your administrator.</p>
      </div>
    </div>
  );
}
