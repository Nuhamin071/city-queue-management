import React from "react";
import { useLocation } from "react-router-dom";

const QueueStatusPage = () => {
  const location = useLocation();
  const { queueNumber, peopleAhead, joinTime, notInQueue } = location.state || {};

  const calculateTimeInQueue = () => {
    if (!joinTime) return "0s"; // If join time is not available, return 0 seconds

    const joinTimestamp = joinTime.toDate(); // Assuming join_time is stored as a Firestore timestamp
    const currentTime = new Date();
    const timeDifference = currentTime - joinTimestamp;

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const displayTime = hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m ${seconds % 60}s`;
    return displayTime;
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {notInQueue ? (
        <h2 style={{ color: "red", fontWeight: "bold" }}>You are not in a queue</h2>
      ) : queueNumber !== null && peopleAhead !== null ? (
        <>
          <h2>Queue Number: <span style={{ fontSize: "40px" }}>{queueNumber}</span></h2>
          <h3>
            People Ahead: <span style={{ fontSize: "30px" }}>{peopleAhead}</span>
          </h3>
          <h4>
            Time in Queue: <span style={{ fontSize: "25px" }}>{calculateTimeInQueue()}</span>
          </h4>
        </>
      ) : (
        <p>No queue data available.</p>
      )}
    </div>
  );
};

export default QueueStatusPage;
