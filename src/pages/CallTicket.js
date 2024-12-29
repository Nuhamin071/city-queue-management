import React, { useState, useEffect } from "react";
import { db, doc, collection, query, where, onSnapshot, updateDoc } from "../firebase";

const CallTicket = ({ kebeleId, subcityId, serviceId }) => {
  const [currentTicket, setCurrentTicket] = useState(null);
  const [error, setError] = useState(null);
  const [ticketCalled, setTicketCalled] = useState(false);

  useEffect(() => {
    if (!kebeleId || !subcityId || !serviceId) {
      setError("Missing location or service details.");
      return;
    }

    const queueQuery = query(
      collection(db, "queue"),
      where("kebele_id", "==", parseInt(kebeleId, 10)),
      where("subcity_id", "==", parseInt(subcityId, 10)),
      where("service_id", "==", serviceId),
      where("status", "in", ["waiting", "getting service", "called"]) // Include "called" status as well
    );

    const unsubscribe = onSnapshot(queueQuery, (snapshot) => {
      if (!snapshot.empty) {
        const firstTicketDoc = snapshot.docs[0];
        const ticketData = {
          id: firstTicketDoc.id,
          ...firstTicketDoc.data(),
        };

        setCurrentTicket(ticketData);
      } else {
        setCurrentTicket(null);
        setError("No tickets in the queue.");
      }
    });

    return () => unsubscribe();
  }, [kebeleId, subcityId, serviceId]);

  const callTicket = async () => {
    if (!currentTicket) {
      setError("No tickets to call.");
      return;
    }

    try {
      const queueRef = doc(db, "queue", currentTicket.id);
      await updateDoc(queueRef, { status: "called" });
      setTicketCalled(true);
      console.log(`Ticket ID ${currentTicket.id} status updated to "called".`);
      setError(null);
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
    } catch (err) {
      console.error(`Error updating ticket status: ${err.message}`);
      setError(`Error updating ticket status: ${err.message}`);
    }
  };

  return (
    <div>
      <h3>Queue Management:</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={callTicket} disabled={!currentTicket || ticketCalled}>
        Call Ticket
      </button>

      {currentTicket ? (
        <table border="1" style={{ width: "100%", marginTop: "10px" }}>
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
              <td>{currentTicket.user_name || "Unknown"}</td>
              <td>{currentTicket.queue_number}</td>
              <td>{currentTicket.status}</td>
              <td>
                <button
                  onClick={() =>
                    updateTicketStatus(currentTicket.id, "getting service")
                  }
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
      ) : (
        <p>No tickets in the queue.</p>
      )}
    </div>
  );
};

export default CallTicket;
