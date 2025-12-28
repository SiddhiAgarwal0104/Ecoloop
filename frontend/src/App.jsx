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

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/shared/ErrorBoundary';

import Navbar from './components/shared/Navbar';
import CreateRequest from './pages/CreateRequest';
import RequestsFeed from './pages/RequestsFeed';
import ChatPage from './pages/ChatPage';
import ActiveLendings from './pages/ActiveLendings';
import MyRequests from './pages/MyRequests';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const { loading, user, token } = useAuth();
  
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4faf6' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#1b5e20', marginBottom: '10px' }}>Loading...</h2>
        </div>
      </div>
    );
  }

  

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4faf6' }}>
      <Navbar />
      
      <Routes>
        {/* <Route path="/" element={<Navigate to="/community/requests" replace />} /> */}
        <Route path="/" element={<RequestsFeed />} />

        <Route path="/community/requests" element={<RequestsFeed />} />
        <Route path="/community/create-request" element={<CreateRequest />} />
        <Route path="/community/chat/:requestId" element={<ChatPage />} />
        <Route path="/community/active-lendings" element={<ActiveLendings />} />
        <Route path="/community/my-requests" element={<MyRequests />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;