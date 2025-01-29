import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaInfoCircle, FaCalendarCheck, FaBell, FaNewspaper, FaBars } from "react-icons/fa";
import "../styles/Sidebar.css";
import Cookies from "js-cookie";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { app } from "../firebase";

const Sidebar = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const userId = Cookies.get("user_id"); // Get user ID from cookies
    const userRole = Cookies.get("user_role"); // Get user role from cookies

    // Function to toggle sidebar visibility
    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    // Use Firestore snapshots to listen for real-time changes in unread notifications
    useEffect(() => {
        if (!userId) {
            console.error("User ID is undefined. Cannot proceed with notifications query.");
            return; // Exit early if userId is undefined
        }

        const db = getFirestore(app);
        const notificationsRef = collection(db, "notifications");

        // Query for unread notifications
        const q = query(notificationsRef, where("userId", "==", userId), where("isRead", "==", false));

        // Listen for real-time updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setUnreadNotificationsCount(snapshot.size); // Update count based on real-time changes
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, [userId]);

    // Render nothing if the user role is not 'user'
    if (userRole !== "user") {
        console.log("User role is not 'user'. Sidebar will not render.");
        return null; // You can also return a different component or message here if needed
    }

    return (
        <div>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                <FaBars />
            </button>

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
                            <Link to="/users/UserAppointmentsPage" style={{ position: "relative" }}>
                                <FaCalendarCheck /> Appointment
                            </Link>
                        </li>
                        {/* Single Link for Notifications */}
                        <li>
                            <Link to="/users/Notfications" style={{ position: "relative" }}>
                                <FaBell /> Notifications
                                {unreadNotificationsCount > 0 && (
                                    <span className="notification-badge">{unreadNotificationsCount}</span>
                                )}
                            </Link>
                        </li>
                        <li>
                            <Link to="/users/News">
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
