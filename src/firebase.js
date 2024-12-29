// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import the correct auth function
import { getFirestore, collection, getDocs, query, where, orderBy, limit, updateDoc, doc ,deleteDoc,getDoc, onSnapshot } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

// Make sure to import getMessaging here
// Your web app's Firebase configuration
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

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app); // Initialize Firestore

// Initialize Firebase Analytics (optional, only if you're using analytics)
const analytics = getAnalytics(app);
const messaging = getMessaging(app);  // Initialize Firebase Messaging


// Export for use in other parts of the app
export { app, auth, db, analytics,messaging, getDocs, query, where, orderBy, limit, updateDoc, doc , collection,deleteDoc,getDoc, onSnapshot }; // Added doc to the exports
