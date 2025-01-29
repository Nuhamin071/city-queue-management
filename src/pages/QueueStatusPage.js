import React, { useEffect, useState } from "react";
import { db, collection, getDocs, query, where, doc, deleteDoc, getDoc } from "../firebase";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import WhenNotification from "./WhenNotfication"; // Import the component
import "../styles/QueueStatusPage.css";

const QueueStatusPage = () => {
  const [waitTime, setWaitTime] = useState(null);
  const [timerId, setTimerId] = useState(null);
  const [queueId, setQueueId] = useState(null);
  const [queueInfo, setQueueInfo] = useState({});
  const [fetchedServiceName, setFetchedServiceName] = useState("");
  const [queueNumber, setQueueNumber] = useState(null);
  const [status, setStatus] = useState(null);
  const [queueDocId, setQueueDocId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServiceName = async (serviceId) => {
      const serviceDocRef = doc(db, "services", serviceId);
      const serviceDocSnapshot = await getDoc(serviceDocRef);
      if (serviceDocSnapshot.exists()) {
        setFetchedServiceName(serviceDocSnapshot.data().name);
      } else {
        console.log("Service not found with ID:", serviceId);
      }
    };

    const fetchQueueData = async (userId) => {
      const queueQuery = query(collection(db, "queue"), where("user_id", "==", userId));
      const querySnapshot = await getDocs(queueQuery);

      if (!querySnapshot.empty) {
        const queueDoc = querySnapshot.docs[0];
        setQueueId(queueDoc.id);
        setQueueDocId(queueDoc.id);
        const queueData = queueDoc.data();
        setQueueInfo(queueData);

        const timestamp = queueData.timestamp;
        const serviceId = queueData.service_id;

        if (timestamp) {
          calculateWaitTime(timestamp);
          startRealTimeClock(timestamp);
        }

        if (serviceId) {
          await fetchServiceName(serviceId);
        }

        setQueueNumber(queueData.queue_number);

        if (queueData.status === "waiting") {
          setStatus("waiting");
        } else if (queueData.status === "called") {
          setStatus("called");
        } else if (queueData.status === "removed") {
          setStatus("removed");
          setQueueId(null);
        }
      } else {
        console.log("No queue found for user ID:", userId);
        setQueueId(null);
      }
    };

    const startRealTimeClock = (timestamp) => {
      const intervalId = setInterval(() => {
        calculateWaitTime(timestamp);
      }, 1000);
      setTimerId(intervalId);
    };

    const fetchQueueInfo = async () => {
      const userId = Cookies.get("user_id");
      if (userId) {
        await fetchQueueData(userId);
      } else {
        console.log("User ID not found in cookies.");
      }
    };

    fetchQueueInfo();

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [timerId]);

  const calculateWaitTime = (timestamp) => {
    const currentTime = new Date();
    const joinTime = timestamp.toDate();
    const timeDiff = currentTime - joinTime;

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    setWaitTime({ hours, minutes, seconds });
  };

  const removeFromQueue = async () => {
    if (!queueDocId) return;

    try {
      setLoading(true);
      const queueRef = doc(db, "queue", queueDocId);

      await deleteDoc(queueRef);

      console.log(`User removed from the queue with ID: ${queueDocId}`);
      setQueueId(null);
      setQueueInfo({});
      setStatus(null);
      alert("You have been removed from the queue.");
    } catch (error) {
      console.error("Error removing user from the queue:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "20px", fontSize: "20px" }}>
        ← Back
      </button>

      <h3>Queue Status</h3>

      {status === "called" ? (
        <div>
          <h3>You are called!</h3>
          <p>Your Queue Number: {queueNumber}</p>
          <button onClick={removeFromQueue} disabled={loading}>
            {loading ? "Removing..." : "Cancel Queue"}
          </button>
        </div>
      ) : (
        <div>
          {queueId === null ? (
            <div>
              <h3>You are not on the queue.</h3>
            </div>
          ) : (
            <div>
              <div className="queue-info">
                <div className="queue-number">{queueNumber}</div>
                <p className="queue-text">
                  Current number in the queue for <span className="service-name">{fetchedServiceName}</span>.
                </p>
                <p className="people-ahead">People ahead: {queueInfo.peopleAhead?.inQueue || 0}</p>
              </div>

              <div className="wait-time">
                {waitTime !== null ? (
                  <div className="time-display">
                    <div className="time-box">{waitTime.hours}</div>
                    <div className="time-colon">:</div>
                    <div className="time-box">{waitTime.minutes}</div>
                    <div className="time-colon">:</div>
                    <div className="time-box">{waitTime.seconds}</div>
                  </div>
                ) : (
                  <p>Calculating your wait time...</p>
                )}
              </div>

              <div className="cancel-btn-container">
                <button onClick={removeFromQueue} disabled={loading} className="cancel-btn">
                  {loading ? "Removing..." : "Cancel Queue"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conditionally render WhenNotification */}
      {queueId && <WhenNotification queueId={queueId} />}
    </div>
  );
};

export default QueueStatusPage;
