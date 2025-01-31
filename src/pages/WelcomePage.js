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
    <div className="welcome-container">
        <img src="ethiopian-flag-url" alt="Ethiopian Flag" className="ethiopian-flag" />
  <h1>Welcome!</h1>
  <p>Join the Queue!</p>
  <button className="welcome-button" onClick={handleGetStarted}>
        Get Started
      </button>
      <img src="amhara-flag-url" alt="Amhara Flag" className="amhara-flag" />
  
  {/* Ball animation container */}
  <div className="ball-container">
    {/* Small balls */}
    <div className="ball small-ball"></div>
    <div className="ball small-ball"></div>
    
    {/* Big balls */}
    <div className="ball big-ball"></div>
    <div className="ball big-ball"></div>
  </div>
</div>

    
     
   
  );
};

export default WelcomePage;
