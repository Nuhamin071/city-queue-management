import React, { useState, useEffect } from "react";
import { db, doc, collection, query, where, onSnapshot, updateDoc } from "../firebase";
import Cookies from "js-cookie";

const AppointmentTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ id: null, newDate: "", newTime: "" });

  const kebeleId = Cookies.get("kebele_id");
  const subcityId = Cookies.get("subcity_id");

  useEffect(() => {
    if (!kebeleId || !subcityId) {
      setError("Missing location details.");
      return;
    }

    const appointmentQuery = query(
      collection(db, "appointments"),
      where("kebele_id", "==", kebeleId),
      where("subcity_id", "==", subcityId)
    );

    const unsubscribe = onSnapshot(appointmentQuery, (snapshot) => {
      const fetchedAppointments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAppointments(fetchedAppointments);
    });

    return () => unsubscribe();
  }, [kebeleId, subcityId]);

  const sendNotification = async (userFcmToken, message) => {
    try {
      const response = await fetch("http://localhost:5001/sendNotification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userFcmToken,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }
    } catch (err) {
      console.error("Notification Error:", err);
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      const appointmentRef = doc(db, "appointments", id);
      await updateDoc(appointmentRef, { status });
      setAppointments((prev) => prev.map((app) => (app.id === id ? { ...app, status } : app)));
      sendNotification(id, `Your appointment status has been updated to: ${status}`);
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.id || !rescheduleData.newDate || !rescheduleData.newTime) {
      alert("Please select a new date and time");
      return;
    }

    try {
      const appointmentRef = doc(db, "appointments", rescheduleData.id);
      await updateDoc(appointmentRef, { day: rescheduleData.newDate, time: rescheduleData.newTime, status: "rescheduled" });
      sendNotification(rescheduleData.id, `Your appointment has been rescheduled to ${rescheduleData.newDate} at ${rescheduleData.newTime}`);
      setRescheduleData({ id: null, newDate: "", newTime: "" });
    } catch (err) {
      console.error("Reschedule Error:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h3>Appointments</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table border="1" style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Bride</th>
            <th>Groom</th>
            <th>Email</th>
            <th>Day</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>{appointment.brideFullName}</td>
              <td>{appointment.groomFullName}</td>
              <td>{appointment.email}</td>
              <td>{appointment.day}</td>
              <td>{appointment.time}</td>
              <td>
                <button onClick={() => updateAppointmentStatus(appointment.id, "accepted")}>
                  Accept
                </button>
                <button onClick={() => updateAppointmentStatus(appointment.id, "rejected")}>
                  Reject
                </button>
                <button onClick={() => setRescheduleData({ id: appointment.id, newDate: "", newTime: "" })}>
                  Reschedule
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rescheduleData.id && (
        <div style={{ marginTop: "20px" }}>
          <h4>Reschedule Appointment</h4>
          <label>
            New Date:
            <input
              type="date"
              value={rescheduleData.newDate}
              onChange={(e) => setRescheduleData((prev) => ({ ...prev, newDate: e.target.value }))}
            />
          </label>
          <label>
            New Time:
            <input
              type="time"
              value={rescheduleData.newTime}
              onChange={(e) => setRescheduleData((prev) => ({ ...prev, newTime: e.target.value }))}
            />
          </label>
          <button onClick={handleReschedule}>Confirm Reschedule</button>
        </div>
      )}
    </div>
  );
};

export default AppointmentTable;
