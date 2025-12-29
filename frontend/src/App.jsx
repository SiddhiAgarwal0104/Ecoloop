// import ActiveLendingsSimple from "./pages/ActiveLendingsSimple";
        <Route
          path="/community/active-lendings-simple"
          element={
            <PrivateRoute>
              <>
                <Navbar />
                <ActiveLendingsSimple />
              </>
            </PrivateRoute>
          }
        />
import ActiveLendingsSimple from "./pages/ActiveLendingsSimple";
        <Route
          path="/community/active-lendings-simple"
          element={
            <PrivateRoute>
              <>
                <Navbar />
                <ActiveLendingsSimple />
              </>
            </PrivateRoute>
          }
        />
// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import './App.css';

// import { AuthProvider } from './context/AuthContext';
// import ErrorBoundary from './components/shared/ErrorBoundary';

// import Navbar from './components/shared/Navbar';
// import CreateRequest from './pages/CreateRequest';
// import RequestsFeed from './pages/RequestsFeed';
// import ChatPage from './pages/ChatPage';
// import ActiveLendings from './pages/ActiveLendings';
// import MyRequests from './pages/MyRequests';
// import { useAuth } from './context/AuthContext';

// function AppContent() {
//   const { loading } = useAuth();
  
//   if (loading) {
//     return (
//       <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4faf6' }}>
//         <div style={{ textAlign: 'center' }}>
//           <h2 style={{ color: '#1b5e20', marginBottom: '10px' }}>Loading...</h2>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f4faf6' }}>
//       <Navbar />
      
//       <Routes>
//         <Route path="/" element={<Navigate to="/community/requests" replace />} />
//         <Route path="/community/requests" element={<RequestsFeed />} />
//         <Route path="/community/create-request" element={<CreateRequest />} />
//         <Route path="/community/chat/:requestId" element={<ChatPage />} />
//         <Route path="/community/active-lendings" element={<ActiveLendings />} />
//         <Route path="/community/my-requests" element={<MyRequests />} />
//       </Routes>

//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//       />
//     </div>
//   );
// }

// function App() {
//   return (
//     <ErrorBoundary>
//       <AuthProvider>
//         <BrowserRouter>
//           <AppContent />
//         </BrowserRouter>
//       </AuthProvider>
//     </ErrorBoundary>
//   );
// }

// export default App;

import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";

import Navbar from "./components/shared/Navbar";
import CreateRequest from "./pages/CreateRequest";
import RequestsFeed from "./pages/RequestsFeed";
import ChatPage from "./pages/ChatPage";
import ActiveLendings from "./pages/ActiveLendings";
import MyRequests from "./pages/MyRequests";


import Notifications from "./pages/Notifications";
import api from "./services/api";

//const response = await api.get("/dashboard/household");

function App() {
    // ...existing code...
  return (
    <>
      <Routes>
        {/* 🔹 Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* 🔹 Notifications (Protected) */}
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <>
                <Navbar />
                <Notifications />
              </>
            </PrivateRoute>
          }
        />

        {/* 🔹 Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔹 Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* 🔹 Community (Protected) */}
        <Route
          path="/community/requests"
          element={
            <PrivateRoute>
              <>
                <Navbar />
                <RequestsFeed />
              </>
            </PrivateRoute>
          }
        />

        <Route
          path="/community/create-request"
          element={
            <PrivateRoute>
              <>
                <Navbar />
                <CreateRequest />
              </>
            </PrivateRoute>
          }
        />

        <Route
          path="/community/chat/:requestId"
          //path = "/community/chat/:chatRoomId"

          element={
            <PrivateRoute>
              <>
                <Navbar />
                <ChatPage />
              </>
            </PrivateRoute>
          }
        />

        <Route
          path="/community/active-lendings"
          element={
            <PrivateRoute>
              <>
                <Navbar />
                <ActiveLendings />
              </>
            </PrivateRoute>
          }
        />

        {/* 🔹 Active Lendings Simple (Protected) */}
        <Route
          path="/community/active-lendings-simple"
          element={
            <PrivateRoute>
              <>
                <Navbar />
                <ActiveLendingsSimple />
              </>
            </PrivateRoute>
          }
        />

        <Route
          path="/community/my-requests"
          element={
            <PrivateRoute>
              <>
                <Navbar />
                <MyRequests />
              </>
            </PrivateRoute>
          }
        />

        {/* 🔹 Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
