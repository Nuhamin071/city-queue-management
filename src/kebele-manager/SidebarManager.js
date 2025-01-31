import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaUsers, FaBuilding, FaBars, FaSignOutAlt } from "react-icons/fa"; // Icons from react-icons
import "../styles/Sidebar.css"; // Assuming the styles are in a separate CSS file
import Cookies from "js-cookie";

const SidebarManager = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isStaffDropdownVisible, setIsStaffDropdownVisible] = useState(false); // For managing dropdown visibility

  const userRole = Cookies.get("user_role"); // Assuming the role is stored in cookies

  // If the user is not a manager, don't show the sidebar
  if (userRole !== "manager") {
    return null; // This hides the sidebar for non-managers
  }

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleLogout = () => {
    Cookies.remove("user_role");
    Cookies.remove("user_token"); // Remove any authentication token
    window.location.href = "/login"; // Redirect to login page
  };

  const toggleStaffDropdown = () => {
    setIsStaffDropdownVisible(!isStaffDropdownVisible);
  };

  return (
    <div>
      {/* Sidebar Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
        <FaBars />
      </button>

      {/* Sidebar Content */}
      <div className={`sidebar ${isSidebarVisible ? "visible" : ""}`}>
        <div className="sidebar-content">
          <ul>
            {/* Home */}
            <li>
              <Link to="/kebele-manager/Home">
                <FaHome /> Home
              </Link>
            </li>

            {/* Departments Section */}
            <li>
              <Link to="/kebele-manager/Department">
                <FaBuilding /> Department
              </Link>
            </li>

            {/* Staff Members Section with Dropdown */}
            <li>
              <div onClick={toggleStaffDropdown} style={{ cursor: "pointer" }}>
                <FaUsers /> Staff Members
              </div>
              {isStaffDropdownVisible && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/kebele-manager/StaffMembers">View Staff</Link>
                  </li>
                  <li>
                    <Link to="/kebele-manager/ManageStaff">Manage Staff</Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Logout */}
            <li>
              <button className="logout-button" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SidebarManager;
