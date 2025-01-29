import React, { useState } from "react";
import { collection, addDoc, serverTimestamp, getDocs, query, where, getFirestore, doc, deleteDoc } from "firebase/firestore";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/Popup.css";
import Cookies from "js-cookie";

const QueueJoined = ({ service, onClose, userId, kebeleId, subcityId }) => {
  const [queueStatus, setQueueStatus] = useState(null); // State to hold the queue status
  const [queueDocId, setQueueDocId] = useState(null); // State to store the document ID of the queue entry
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  // Function to join the queue
  const joinQueue = async () => {
    if (!userId || !kebeleId || !subcityId) {
      console.error("Missing data:", { userId, kebeleId, subcityId });
      setQueueStatus("Error: Missing necessary data. Please try again.");
      return;
    }

    try {
      setLoading(true); // Set loading to true when starting the operation
      const db = getFirestore(app);
      const queueRef = collection(db, "queue");

      // Query to check if the user is already in the queue
      const existingQueueQuery = query(
        queueRef,
        where("user_id", "==", userId),
        where("kebele_id", "==", Number(kebeleId)),
        where("subcity_id", "==", Number(subcityId)),
        where("service_id", "==", service.key)
      );

      const existingQuerySnapshot = await getDocs(existingQueueQuery);

      if (!existingQuerySnapshot.empty) {
        // User is already in the queue
        setQueueStatus("You are already in the queue.");
        return;
      }

      // Query for specific kebele_id, subcity_id, and service_id
      const q = query(
        queueRef,
        where("kebele_id", "==", Number(kebeleId)),
        where("subcity_id", "==", Number(subcityId)),
        where("service_id", "==", service.key)
      );

      const querySnapshot = await getDocs(q);

      // If no documents exist, start the queue number at 1
      let newQueueNumber = 1;
      if (!querySnapshot.empty) {
        // Find the highest queue number from existing documents and increment it
        const existingQueueNumbers = querySnapshot.docs.map(doc => doc.data().queue_number);
        newQueueNumber = Math.max(...existingQueueNumbers) + 1;
      }

      // Add the new document with the calculated queue number
      const newQueueDoc = await addDoc(queueRef, {
        kebele_id: Number(kebeleId),
        subcity_id: Number(subcityId),
        user_id: userId,
        service_id: service.key,
        timestamp: serverTimestamp(),
        status: "waiting",
        isWait:"false",
        queue_number: newQueueNumber,
      });

      // Store the queue document ID to remove it later
      setQueueDocId(newQueueDoc.id);
      setQueueStatus(`You have successfully joined the queue! Your queue number is ${newQueueNumber}.`);
      console.log("Document added with ID:", newQueueDoc.id);

      // Pass the queueDocId (queue_id) to other components or use it elsewhere
      Cookies.set("queueId", newQueueDoc.id);
    
    } catch (error) {
      console.error("Error adding document:", error);
      setQueueStatus("Error: Could not join the queue. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after operation is complete
    }
  };

  // Function to remove the user from the queue
  const removeFromQueue = async () => {
    if (queueDocId) {
      try {
        setLoading(true); // Set loading to true while deleting
        const db = getFirestore(app);
        const queueDocRef = doc(db, "queue", queueDocId);

        // Delete the document from Firestore
        await deleteDoc(queueDocRef);

        setQueueStatus("You have been removed from the queue.");
        setQueueDocId(null); // Reset the queue document ID
      } catch (error) {
        console.error("Error removing document:", error);
        setQueueStatus("Error: Could not remove from the queue. Please try again.");
      } finally {
        setLoading(false); // Set loading to false after operation is complete
      }
    } else {
      setQueueStatus("Error: No queue entry found.");
    }
  };

  // Navigate to the "View Description" page
  const handleViewDescription = () => {
    navigate("/viewdescription", { state: { service } }); // Pass service data to ViewDescription page
  };

  return (
    <div className="popup">
      <div className="popup-content">
        {/* Close button */}
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <h2>{service.name}</h2>
        <p>Status: {service.status}</p>

        {/* Show Join Queue button */}
        {!queueDocId && <button onClick={joinQueue} disabled={loading}>Join Queue</button>}
        
        <button onClick={handleViewDescription}>View Description</button>

        {/* Display the queue status */}
        {queueStatus && <p>{queueStatus}</p>}

        {/* Show Remove Me button only if user has joined the queue */}
        {queueDocId && (
          <>
            <button onClick={removeFromQueue} disabled={loading}>Remove Me</button>
          </>
        )}
      </div>
    </div>
  );
};

export default QueueJoined;
