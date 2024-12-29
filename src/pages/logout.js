import React from "react";
import { auth } from "../firebase"; // Import Firebase auth instance
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Import js-cookie to handle cookies

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("You are about to log out. Are you sure?");

    if (confirmLogout) {
      try {
        // Sign out using Firebase Authentication
        await auth.signOut();

        // Clear user-related data from localStorage
        localStorage.removeItem("user_id");
        localStorage.removeItem("fullname");

        // Remove cookies
        Cookies.remove("user_id");
        Cookies.remove("fullname");
        Cookies.remove("fcmToken");
        Cookies.remove("user_role"); // Remove the role cookie

        // Redirect to the welcome page or desired route
        navigate("/");  // Change this to the route where you want the user to go after logging out

        console.log("User logged out successfully");
      } catch (error) {
        console.error("Error logging out: ", error.message);
      }
    } else {
      console.log("Logout canceled");
    }
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};

export default Logout;
