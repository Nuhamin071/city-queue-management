import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaInfoCircle, FaCalendarCheck, FaBell, FaNewspaper, FaBars } from "react-icons/fa";
import "../styles/Sidebar.css";
import Cookies from "js-cookie";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { app } from "../firebase";

const Sidebar = ({ isSidebarVisible, toggleSidebar }) => {
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [unreadAppointmentsCount, setUnreadAppointmentsCount] = useState(0); // To track unread appointments
    const userId = Cookies.get("user_id"); // Get user ID from cookies
    const userRole = Cookies.get("user_role"); // Get user role from cookies

    useEffect(() => {
        if (!userId) {
            console.error("User ID is undefined. Cannot proceed with notifications query.");
            return;
        }

        const db = getFirestore(app);

        // Query for unread notifications
        const notificationsRef = collection(db, "notifications");
        const notificationsQuery = query(notificationsRef, where("userId", "==", userId), where("isRead", "==", false));
        const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
            setUnreadNotificationsCount(snapshot.size);
        });

        // Query for unread appointments
        const appointmentsRef = collection(db, "appointments");
        const appointmentsQuery = query(appointmentsRef, where("user_id", "==", userId), where("isRead", "==", false));
        const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
            setUnreadAppointmentsCount(snapshot.size);
        });

        return () => {
            unsubscribeNotifications();
            unsubscribeAppointments();
        };
    }, [userId]);

    if (userRole !== "user") {
        return null;
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
                                {unreadAppointmentsCount > 0 && (
                                    <span className="notification-badge">{unreadAppointmentsCount}</span> // Show badge for unread appointments
                                )}
                            </Link>
                        </li>
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
