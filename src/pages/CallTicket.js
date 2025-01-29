import React, { useState, useEffect } from "react";
import { db, doc, collection, query, where, onSnapshot, updateDoc, getDoc } from "../firebase";

const CallTicket = ({ kebeleId, subcityId, serviceId }) => {
  const [currentTicket, setCurrentTicket] = useState(null);
  const [userName, setUserName] = useState(null);
  const [error, setError] = useState(null);
 
  const [showTable, setShowTable] = useState(false); // New state variable to control table visibility

  useEffect(() => {
    if (!kebeleId || !subcityId || !serviceId) {
      setError("Missing location or service details.");
      console.log("Error: Missing location or service details.");
      return;
    }

    const queueQuery = query(
      collection(db, "queue"),
      where("kebele_id", "==", parseInt(kebeleId, 10)),
      where("subcity_id", "==", parseInt(subcityId, 10)),
      where("service_id", "==", serviceId),
      where("status", "in", ["waiting", "getting service", "called"])
    );

    const unsubscribe = onSnapshot(queueQuery, async (snapshot) => {
      if (!snapshot.empty) {
        const firstTicketDoc = snapshot.docs[0];
        const ticketData = { id: firstTicketDoc.id, ...firstTicketDoc.data() };
        setCurrentTicket(ticketData);

        // Fetch user's name using user_id
        if (ticketData.user_id) {
          const userRef = doc(db, "users", ticketData.user_id);
          const userSnapshot = await getDoc(userRef);
          setUserName(userSnapshot.exists() ? userSnapshot.data().fullname : "Unknown");
        } else {
          setUserName("Unknown");
        }
        setError(null);
      } else {
        setCurrentTicket(null);
        setError(null);
      }
    });

    return () => unsubscribe();
  }, [kebeleId, subcityId, serviceId]);

  // Function to send notification
  const sendNotification = async (userId, newStatus, notificationType) => {
    try {
      const response = await fetch("http://localhost:5001/sendNotification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          newStatus: newStatus,
          notificationType: notificationType,
        }),
      });

      if (response.ok) {
        console.log("Notification sent successfully");
      } else {
        console.log("Failed to send notification");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Call ticket function
  const callTicket = async () => {
    if (!currentTicket) {
      setError("No tickets to call.");
      return;
    }

    try {
      const queueRef = doc(db, "queue", currentTicket.id);
      await updateDoc(queueRef, { status: "called" });
      
      console.log(`Ticket ID ${currentTicket.id} status updated to "called".`);
      setError(null);

      // Send notification only if status is "called"
      sendNotification(currentTicket.user_id, "called", "queue");

      // Show the table when a ticket is called
      setShowTable(true); 

    } catch (err) {
      console.error(`Error updating ticket status: ${err.message}`);
      setError(`Error updating ticket status: ${err.message}`);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      const queueRef = doc(db, "queue", ticketId);
      await updateDoc(queueRef, { status });
      console.log(`Ticket ID ${ticketId} updated to status: ${status}`);

      // Send notification only if status is "called" or "removed"
      if (status === "called" || status === "removed") {
        sendNotification(currentTicket.user_id, status, "queue");
      }

    } catch (err) {
      console.error(`Error updating ticket status: ${err.message}`);
      setError(`Error updating ticket status: ${err.message}`);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h3>Queue Management:</h3>
      
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={callTicket} >
        Call Ticket
      </button>

      {!currentTicket && !error && (
        <p style={{ marginTop: "20px", color: "gray", fontSize: "16px" }}>
          No queue available.
        </p>
      )}

      {showTable && currentTicket && (
        <div style={{ marginTop: '20px' }}>
          <h4>Current Ticket Details:</h4>
          <table border="1" style={{ width: "100%", marginTop: "20px" }}>
            <thead>
              <tr>
                <th>User Name</th>
                <th>Queue Number</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{userName}</td>
                <td>{currentTicket.queue_number}</td>
                <td>{currentTicket.status}</td>
                <td>
                  <button
                    onClick={() => updateTicketStatus(currentTicket.id, "getting service")}
                  >
                    Get
                  </button>
                  <button
                    onClick={() => updateTicketStatus(currentTicket.id, "removed")}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CallTicket;
