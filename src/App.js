import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { generateToken, messaging } from "./firebase";
import { useNavigate } from "react-router-dom";
import { onMessage } from "firebase/messaging";
import Cookies from "js-cookie";
import Sidebar from './pages/Sidebar';
import SidebarManager from './pages/SidebarManager';
import WelcomePage from "./pages/WelcomePage";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import Profile from "./pages/profile";
import KebeleProfile from "./pages/KebeleProfile";
import Logout from "./pages/logout";
import Home from './kebele-manager/Home';
import Department from './kebele-manager/Department';
import QueueJoined from "./pages/QueueJoined";
import StaffProfile from "./pages/StaffProfile";
import CallTicket from "./pages/CallTicket";
import AppointmentPage from "./pages/AppointmentPage";
import RealtimeQueue from "./pages/realtimeQueue";
import QueueStatusPage from "./pages/QueueStatusPage";
import News from "./users/News";
import StaffMembers from "./kebele-manager/StaffMembers";
import ManageStaff from "./kebele-manager/ManageStaff";
import UserAppointmentsPage from "./users/UserAppointmentsPage";
import Status from "./pages/Status";
import Notfications from "./users/Notfications";


const App = () => {
  return (
    <Router>
      <Main />
    </Router>
  );
};

const Main = () => {
  const navigate = useNavigate(); // Move useNavigate here
  const location = useLocation();
  const userRole = Cookies.get("user_role");

  useEffect(() => {
    generateToken();
    onMessage(messaging, (payload) => {
      console.log('Message received foreground. ', payload);
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(function (registration) {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function (error) {
          console.log('Service Worker registration failed:', error);
        });
    }

    const notificationFlag = Cookies.get('showStatusPage');
    if (notificationFlag) {
      navigate('/Status');
      Cookies.remove('showStatusPage'); // Remove flag after navigation
    }
  }, [navigate]);

  const hideSidebarRoutes = ['/login', '/signup'];
  const isManager = userRole === "manager";

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Conditionally render Sidebar or SidebarManager based on the role */}
      {!hideSidebarRoutes.includes(location.pathname) && (
        <div
          style={{
            width: isManager ? "250px" : "200px",
            backgroundColor: "#f4f4f4",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          {isManager ? <SidebarManager /> : <Sidebar />}
        </div>
      )}

      {/* Main content area */}
      <div
        style={{
          marginLeft: isManager ? "250px" : "200px",
          padding: "20px",
          width: "100%",
          overflowY: "auto",
        }}
      >
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/KebeleProfile" element={<KebeleProfile />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/StaffProfile" element={<StaffProfile />} />
          <Route path="/users/UserAppointmentsPage" element={<UserAppointmentsPage />} />
          <Route path="/users/Notfications" element={<Notfications />} />
          <Route path="/kebele-manager/Home" element={<Home />} />
          <Route path="/kebele-manager/Department" element={<Department />} />
          <Route path="/kebele-manager/StaffMembers" element={<StaffMembers />} />
          <Route path="/kebele-manager/ManageStaff" element={<ManageStaff />} />
          <Route path="/QueueJoined" element={<QueueJoined />} />
          <Route path="/CallTicket" element={<CallTicket />} />
          <Route path="/Status" element={<Status />} />
          <Route path="/realtimeQueue" element={<RealtimeQueue />} />
          <Route path="/QueueStatusPage" element={<QueueStatusPage />} />
          <Route path="/AppointmentPage" element={<AppointmentPage />} />
          <Route path="/users/News" element={<News />} />
         
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
