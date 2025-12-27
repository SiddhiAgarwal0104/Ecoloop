import React from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

export default function MainLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-column">
        <Topbar />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
