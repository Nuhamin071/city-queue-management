import { useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase"; // Import the messaging instance

const useFCM = () => {
  const [fcmToken, setFcmToken] = useState(null);

  // Function to request notification permission and generate the FCM token
  const requestNotificationPermission = async () => {
    try {
      // Check if fcmToken is already stored in localStorage
      const storedFcmToken = localStorage.getItem("fcmToken");

      if (storedFcmToken) {
        console.log("FCM Token already exists:", storedFcmToken);
        setFcmToken(storedFcmToken);
        return storedFcmToken;
      } else {
        // If no token exists, request permission and generate a new token
        const permission = await Notification.requestPermission();
        
        if (permission === "granted") {
          console.log("Notification permission granted.");

          const currentToken = await getToken(messaging, {
            vapidKey: "BOfQNCkVWauDcnX8As4vKqFk182zWhvYB2Z_e0j-ypBBNIQkWCs9n86rb3eIm7Jv_I-gTJMi346N2dk4kEfY8Vw", // Use your actual VAPID key
          });

          if (currentToken) {
            console.log("FCM Token generated:", currentToken);
            localStorage.setItem("fcmToken", currentToken); // Store token locally
            setFcmToken(currentToken); // Update state with the token
            return currentToken;
          } else {
            console.warn("No FCM token is available.");
            return null;
          }
        } else {
          console.warn("Notification permission denied.");
          return null;
        }
      }
    } catch (error) {
      console.error("Error during FCM token generation:", error);
      return null;
    }
  };

  // Foreground message listener
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      const notificationTitle = payload.notification.title;
      const notificationBody = payload.notification.body;
  
      // Ensure notifications are triggered
      if (Notification.permission === 'granted') {
        new Notification(notificationTitle, {
          body: notificationBody,
          icon: "/firebase-logo.png",
        });
        console.log('Notification should appear now');
      } else {
        console.warn("Notification permission not granted");
      }
    });
  
    return () => unsubscribe(); // Cleanup on component unmount
  }, []);
  

  // Function to send FCM token to backend
  const sendFcmTokenToBackend = async (token) => {
    if (!token) {
      console.error("FCM Token is not available");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fcmToken: token,
          title: "Test Notification",  // Set title here
          body: "This is a test notification",  // Set body here
        }),
      });
  
      const data = await response.json();
      if (data.message === "Notification sent successfully") {
        console.log("Notification sent from frontend to backend.");
      } else {
        console.error("Failed to send notification:", data);
      }
    } catch (error) {
      console.error("Error sending notification to backend:", error);
    }
  };

  // Returning functions to be used in the component
  return { requestNotificationPermission, sendFcmTokenToBackend, fcmToken };
};

export default useFCM;
