// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import useFCM from './hooks/useFCM'; // Import your custom useFCM hook
import Sidebar from './pages/Sidebar'; // Import Sidebar

import WelcomePage from "./pages/WelcomePage";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import Profile from "./pages/profile";
import KebeleProfile from "./pages/KebeleProfile";
import Logout from "./pages/logout";
import KebeleManager from "./pages/KebeleManager";
import QueueJoined from "./pages/QueueJoined";
import StaffProfile from "./pages/StaffProfile";
import CallTicket from "./pages/CallTicket";
import AppointmentPage from "./pages/AppointmentPage";
import RealtimeQueue from "./pages/realtimeQueue";
import QueueStatusPage from "./pages/QueueStatusPage";

// App Component
const App = () => {
  const { requestNotificationPermission } = useFCM();

  // Handle Notification and Service Worker registration
  useEffect(() => {
    requestNotificationPermission();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, [requestNotificationPermission]);

  return (
    <Router>
      <Main /> {/* Render Main component where location hook is used */}
    </Router>
  );
};

// Main component where location hook is used
const Main = () => {
  const location = useLocation();  // Get current route location

  // Define routes where the sidebar should be hidden
  const hideSidebarRoutes = ['/login', '/signup'];

  return (
    <div style={{ display: "flex" }}>
      {/* Conditionally render Sidebar */}
      {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}

      <div style={{ marginLeft: "250px", padding: "20px" }}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/KebeleProfile" element={<KebeleProfile />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/StaffProfile" element={<StaffProfile />} />
          <Route path="/KebeleManager" element={<KebeleManager />} />
          <Route path="/QueueJoined" element={<QueueJoined />} />
          <Route path="/CallTicket" element={<CallTicket />} />
          <Route path="/realtimeQueue" element={<RealtimeQueue />} />
          <Route path="/QueueStatusPage" element={<QueueStatusPage />} />
          <Route path="/AppointmentPage" element={<AppointmentPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
