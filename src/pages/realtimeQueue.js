import React, { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs, getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Import js-cookie for cookies management

const RealtimeQueue = () => {
  const [queueId, setQueueId] = useState(null); // State to store queueId
  const [kebeleId] = useState(Cookies.get("kebele_id")); // Fetch kebeleId from cookies
  const [subcityId] = useState(Cookies.get("subcity_id")); // Fetch subcityId from cookies
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();

  // Function to fetch queue status
  const fetchQueueStatus = useCallback(async (userId) => {
    if (!queueId) {
      // Navigate to QueueStatusPage with a "notInQueue" flag if queueId is missing
      navigate("/QueueStatusPage", { state: { notInQueue: true } });
      return;
    }

    if (!kebeleId || !subcityId) {
      setError("Kebele and Subcity are required.");
      return;
    }

    setIsFetching(true);
    try {
      const db = getFirestore(app);

      // Fetch the queue document by its ID
      const queueDocRef = doc(db, "queue", queueId);
      const queueDocSnapshot = await getDoc(queueDocRef);

      if (!queueDocSnapshot.exists()) {
        navigate("/QueueStatusPage", { state: { notInQueue: true } });
        return;
      }

      const queueData = queueDocSnapshot.data();
      const queueNumber = queueData.queue_number;
      const joinTime = queueData.join_time;

      // Query to find the number of people ahead in the queue
      const peopleAheadQuery = query(
        collection(db, "queue"),
        where("kebele_id", "==", Number(kebeleId)),
        where("subcity_id", "==", Number(subcityId)),
        where("service_id", "==", queueData.service_id),
        where("queue_number", "<", queueData.queue_number)
      );

      const peopleAheadSnapshot = await getDocs(peopleAheadQuery);
      const peopleAhead = peopleAheadSnapshot.size;

      // Navigate to the queue status page with relevant data
      navigate("/QueueStatusPage", {
        state: { queueNumber, peopleAhead, joinTime },
      });
    } catch (err) {
      console.error("Error fetching queue status:", err);
      setError("An error occurred. Ensure required Firestore indexes are configured.");
    } finally {
      setIsFetching(false);
    }
  }, [kebeleId, subcityId, queueId, navigate]);

  // Load the queueId from cookies on component mount
  useEffect(() => {
    const storedQueueId = Cookies.get("queueId");
    if (storedQueueId) {
      setQueueId(storedQueueId);
      console.log("Queue ID from cookies:", storedQueueId);
    } else {
      console.error("Queue ID not found in cookies.");
    }
  }, []);

  // Function to handle manual fetch requests
  const handleFetchQueueStatus = () => {
    const userId = Cookies.get("user_id");
    if (userId) {
      fetchQueueStatus(userId);
    } else {
      setError("User ID not found in cookies.");
    }
  };

  return (
    <div>
      <button className="welcome-button"
        onClick={handleFetchQueueStatus}
        disabled={isFetching}
       
      >
        {isFetching ? "Loading..." : "Check Queue Status"}
      </button>

      {/* Display error after clicking the button */}
      {error && (
        <p style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default RealtimeQueue;
