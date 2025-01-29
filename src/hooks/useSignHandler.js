import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import useFCM from "../hooks/useFCM"; // Import the FCM hook
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // You can use js-cookie for secure cookie management
import { generateToken } from "../firebase";


// Custom hook for handling sign up logic
const useSignUpHandler = (email, password, fullname) => {


  const [isLoading, setIsLoading] = useState(false);
  const { requestNotificationPermission } = useFCM();
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (!email || !password || !fullname) {
      alert("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      // Firebase authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Request FCM token
      const fcmToken = await requestNotificationPermission();

      // Store user data in Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        fullname,
        email,
        user_id: user.uid,
        role: "user", // Set role as "user"
        fcmToken: fcmToken || "", // FCM token (if available)
      });

      // Securely store user data in HttpOnly cookies
      Cookies.set("user_id", user.uid, { secure: true, sameSite: "Strict" });
      Cookies.set("fullname", fullname, { secure: true, sameSite: "Strict" });
      Cookies.set("fcmToken", fcmToken, { secure: true, sameSite: "Strict" });
      Cookies.set("user_role", "user", { secure: true, sameSite: "Strict" });  // Store role as "user" in cookie

      console.log("User signed up successfully.");

      // Redirect to the profile page
      navigate("/profile");

      // generate token 
      await generateToken();
    } catch (error) {
      console.error("Signup failed:", error.message);
      alert("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleSignUp };
};

export default useSignUpHandler;
