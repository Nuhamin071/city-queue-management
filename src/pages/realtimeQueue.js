import React, { useState, useEffect } from "react";
import { db, doc, onSnapshot, collection, query, where, getDocs, getDoc } from "../firebase";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/realtimequeue.css";

const RealtimeQueue = () => {
  const navigate = useNavigate();
  const [peopleAhead, setPeopleAhead] = useState({
    inQueue: null, // Combined waiting and getting services
    called: null,   // Called status only
  });
  const [serviceName, setServiceName] = useState(null);
  const [kebeleName, setKebeleName] = useState(null);
  const [subcityName, setSubcityName] = useState(null);
  const [queueNumber, setQueueNumber] = useState(null); // State to store the queue number

  // Fetch queue status and set up real-time listeners
  useEffect(() => {
    const queueId = Cookies.get("queueId");
    console.log("Retrieved queueId:", queueId);  // Log queueId to verify it's being passed

    if (!queueId) {
      console.error("Queue ID not found in cookies");
      return;
    }

    console.log("Queue ID:", queueId);

    // Listen for real-time updates to the specific queue document
    const queueDocRef = doc(db, "queue", queueId);
    const unsubscribeQueue = onSnapshot(queueDocRef, (queueDocSnapshot) => {
      if (!queueDocSnapshot.exists()) {
        console.log("Queue document not found with ID:", queueId);
        return;
      }

      console.log("Queue document data:", queueDocSnapshot.data());
      const queueData = queueDocSnapshot.data();
      const { user_id, service_id, subcity_id, kebele_id, queue_number } = queueData;

      // Fetch additional data and update the state
      fetchData(queueData, user_id, service_id, subcity_id, kebele_id, queue_number);
    });

    // Clean up listener when the component unmounts
    return () => unsubscribeQueue();

  }, []); // Only run once when the component mounts

  // Function to handle real-time people ahead updates
  const fetchData = async (queueData, user_id, service_id, subcity_id, kebele_id, queue_number) => {
    // Set the queue number from the queue document
    setQueueNumber(queue_number); // Set the queue number from Firestore document

    // Fetch service name
    const serviceDocRef = doc(db, "services", service_id);
    const serviceDocSnapshot = await getDoc(serviceDocRef);
    if (serviceDocSnapshot.exists()) {
      setServiceName(serviceDocSnapshot.data().name); // Set the service name
        } else {
      console.log("Service not found");
    }

    // Fetch subcity name based on subcity_id
    const subcityQuery = query(
      collection(db, "subcity"), 
      where("subcity_id", "==", subcity_id)
    );
    const subcitySnapshot = await getDocs(subcityQuery);
    if (!subcitySnapshot.empty) {
      const subcityDoc = subcitySnapshot.docs[0];
      setSubcityName(subcityDoc.data().subcity_name); // Set the subcity name
    } else {
      console.log("Subcity not found");
    }

    // Fetch kebele name based on kebele_id
    const kebeleQuery = query(
      collection(db, "kebele"), 
      where("kebele_id", "==", kebele_id)
    );
    const kebeleSnapshot = await getDocs(kebeleQuery);
    if (!kebeleSnapshot.empty) {
      const kebeleDoc = kebeleSnapshot.docs[0];
      setKebeleName(kebeleDoc.data().kebele_name); // Set the kebele name
    } else {
      console.log("Kebele not found");
    }

    // Real-time listener for inQueue (waiting + getting services)
    const inQueueQuery = query(
      collection(db, "queue"),
      where("subcity_id", "==", subcity_id),
      where("kebele_id", "==", kebele_id),
      where("service_id", "==", service_id),
      where("status", "in", ["waiting", "getting services"])
    );

    // Real-time listener for called (called status)
    const unsubscribeInQueue = onSnapshot(inQueueQuery, (inQueueSnapshot) => {
      // Filter out the user who is currently viewing the queue
      const peopleAheadCount = inQueueSnapshot.docs.filter(doc => doc.data().user_id !== user_id).length;
      setPeopleAhead((prevState) => ({
        ...prevState,
        inQueue: peopleAheadCount, // Update inQueue count excluding the user
      }));
    });

    // Clean up listeners when component unmounts
    return () => unsubscribeInQueue();
  };

  // Function to navigate to Queue Status Page
  const navigateToQueueStatus = () => {
    const queueId = Cookies.get("queueId"); // Retrieve queue_id from cookies

    navigate("/QueueStatusPage", {
      state: {
        serviceName,
        kebeleName,
        subcityName,
        peopleAhead,
        queueNumber, // Pass the queue number to the status page
        queueId,
      },
    });
    };

    return (
    <div className="queuestaus-button">
     
      <button onClick={navigateToQueueStatus} >Go to Queue Status Page</button>
        </div>
    );
};

export default RealtimeQueue;
