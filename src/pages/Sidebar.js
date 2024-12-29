// src/components/Sidebar.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaInfoCircle, FaCalendarCheck, FaBell, FaNewspaper, FaBars } from "react-icons/fa"; // Icons from react-icons
import "../styles/Sidebar.css"; // Move styles to a CSS file
import Cookies from "js-cookie";

const Sidebar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const userRole = Cookies.get("user_role"); // Assuming the role is stored in cookies


  // If the user is staff or has another role, don't show the sidebar
  if (userRole !== "user") {
    return null; // This hides the sidebar for non-users
  }

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div>
      {/* The button to toggle the sidebar */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <FaBars /> {/* Hamburger icon */}
      </button>

      {/* Sidebar that appears/disappears based on the state */}
      <div className={`sidebar ${isSidebarVisible ? "visible" : ""}`}>
        <div className="sidebar-content">
          <ul>
            <li>
              <Link to="/profile">
                <FaUser /> Profile
              </Link>
            </li>
            <li>
              <Link to="/about-us">
                <FaInfoCircle /> About Us
              </Link>
            </li>
            <li>
              <Link to="/appointments">
                <FaCalendarCheck /> Appointments
              </Link>
            </li>
            <li>
              <Link to="/notifications">
                <FaBell /> Notifications
              </Link>
            </li>
            <li>
              <Link to="/news">
                <FaNewspaper /> News
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
