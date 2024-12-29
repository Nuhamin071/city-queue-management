import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import Cookies from "js-cookie";  // Import js-cookie
import "../styles/WelcomePage.css"; // Move styles to a CSS file

const WelcomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get the user_id from cookies instead of localStorage
    const userId = Cookies.get("user_id");
    if (userId) {
      navigate("/profile"); // Automatically navigate to profile if logged in
    }
  }, [navigate]);

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <main className="welcome-container">
      <h1>Welcome to City Queue Management</h1>
      <p>Streamlining your queue experience for better efficiency!</p>
      <button className="welcome-button" onClick={handleGetStarted}>
        Get Started
      </button>
    </main>
  );
};

export default WelcomePage;
