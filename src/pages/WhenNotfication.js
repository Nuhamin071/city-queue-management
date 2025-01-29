import React from 'react';
import { useState } from 'react';
import Cookies from 'js-cookie'; // Ensure js-cookie is imported
import "../styles/WhenNotfication.css";

const WhenNotification = ({ queueId }) => {
  const [loadingThree, setLoadingThree] = useState(false);

  const handleNotifyWhenThreeAhead = async () => {
    setLoadingThree(true);
    try {
      const response = await fetch("http://localhost:5001/sendWhenNotification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Cookies.get("user_id"),
          newStatus: "three_ahead",
          notificationType: "queue",
        }),
      });

      if (response.ok) {
        alert("You will be notified when there are 3 people ahead of you.");
      } else {
        alert("Failed to set notification.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while setting notification.");
    } finally {
      setLoadingThree(false);
    }
  };

  const handleNotifyWhenTurnUp = () => {
    alert("You will be notified when it is your turn.");
    // Optionally, send a request to the server if needed
    // For example, to register this preference in your backend
    // await fetch(...);
  };

  return (
    <div className="notification-section">
  <h2>Notifications</h2>
  <div className="notification-buttons">
    <button onClick={handleNotifyWhenThreeAhead} disabled={loadingThree} className="notify-button">
      {loadingThree ? "Setting Alert..." : "Notify me when I'm 3rd in line"}
    </button>
    <button onClick={handleNotifyWhenTurnUp} className="notify-button">
      Notify me when it's my turn
    </button>
  </div>
</div>

  );
};

export default WhenNotification;
