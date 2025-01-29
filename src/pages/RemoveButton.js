import React from "react";
import Cookies from "js-cookie";
import { getFirestore, doc, deleteDoc } from "firebase/firestore"; // Import Firestore functions
import { app } from "../firebase"; // Import your Firebase app instance

const RemoveButton = ({ queue, setQueue }) => {
  const handleRemove = async () => {
    const db = getFirestore(app); // Initialize Firestore
    const userId = Cookies.get("user_id"); // Get user ID from cookies

    if (!userId) {
      console.error("User ID not found in cookies.");
      return;
    }

    try {
      let foundUser = false; // Flag to check if user is found in queue

      for (const item of queue) {
        if (item.userId === userId) {
          foundUser = true; // User found in queue

          // Reference to the queue document
          const queueRef = doc(db, "queue", item.id); // Use item.id as the document ID

          await deleteDoc(queueRef); // Delete item from main queue
          console.log(`Deleted item for user: ${userId}`);

          // Optionally, update local state to reflect changes immediately
          setQueue(prevQueue => prevQueue.filter(q => q.id !== item.id));
        }
      }

      if (!foundUser) {
        console.warn("User not found in the queue.");
      }

    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  return (
    <button onClick={handleRemove}>
      Remove 
    </button>
  );
};

export default RemoveButton;
