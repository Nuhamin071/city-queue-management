import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import Cookies from "js-cookie"; 
import useFCM from "../hooks/useFCM"; // Import your FCM hook

const useLoginHandler = (email, password) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { requestNotificationPermission } = useFCM(); // Use FCM hook

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data securely
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const { role, fcmToken } = userDoc.data(); // Assuming role and fcmToken are stored in Firestore
        Cookies.set("user_id", user.uid, { secure: true, sameSite: "Strict" });
        Cookies.set("user_role", role, { secure: true, sameSite: "Strict" });  // Store role in cookie

        // Store only a secure session token in the client
        const sessionToken = await user.getIdToken();
        document.cookie = `session_token=${sessionToken}; Secure; HttpOnly; SameSite=Strict`;

        // Check if the user is a staff member and does not have an FCM token
        if (role === "staff" && !fcmToken) {
          const newFcmToken = await requestNotificationPermission(); // Request a new token
          if (newFcmToken) {
            // Update Firestore with the new FCM token
            await updateDoc(userRef, { fcmToken: newFcmToken });
          }
        }

        // Navigate based on role
        switch (role) {
          case "manager":
            navigate("/kebele-manager/Home");
            break;
          case "staff":
            navigate("/StaffProfile");
            break;
          default:
            navigate("/profile");
        }
        
        console.log("User logged in successfully.");
      } else {
        console.error("No user document found in Firestore.");
        alert("Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error.message);
      alert("Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return [isLoading, handleLogin];
};

export default useLoginHandler;
