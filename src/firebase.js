// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore, collection, getDocs, query, where, orderBy, limit, updateDoc, doc ,deleteDoc,getDoc, onSnapshot } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken } from "firebase/messaging";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2DVBbdMCDpTJr4BpuZsAerQowpRsbAF8",
  authDomain: "cityqueuemanagment.firebaseapp.com",
  projectId: "cityqueuemanagment",
  storageBucket: "cityqueuemanagment.firebasestorage.app",
  messagingSenderId: "1064382598662",
  appId: "1:1064382598662:web:a2c9901d6764cd9f673d87",
  measurementId: "G-70DM4H1DSP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

// Function to generate and store FCM token
export const generateToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission not granted.");
      return;
    }

    // Generate the token
    const token = await getToken(messaging, {
      vapidKey: "BOfQNCkVWauDcnX8As4vKqFk182zWhvYB2Z_e0j-ypBBNIQkWCs9n86rb3eIm7Jv_I-gTJMi346N2dk4kEfY8Vw",
    });

    if (token) {
      console.log("Generated FCM Token:", token);

      // Store or update the token in Firestore
      const userId = auth.currentUser?.uid; // Get the logged-in user's ID
      if (userId) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { fcmToken: token });
        console.log("Token stored/updated in Firestore.");
      }
    }
  } catch (error) {
    console.error("Error generating or storing FCM token:", error);
  }
};

// Export Firebase services
export {
  app,
  auth,
  db,
  analytics,
  messaging,getFirestore, collection, getDocs, query, where, orderBy, limit, updateDoc, doc ,deleteDoc,getDoc, onSnapshot
};
