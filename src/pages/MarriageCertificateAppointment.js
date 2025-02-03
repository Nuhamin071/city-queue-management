import React, { useState } from "react";
import Cookies from "js-cookie";
import { getFirestore, collection, addDoc, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase"; 

const MarriageCertificateAppointment = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [brideFirstName, setBrideFirstName] = useState("");
  const [brideLastName, setBrideLastName] = useState("");
  const [groomFirstName, setGroomFirstName] = useState("");
  const [groomLastName, setGroomLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);

  const appointments = [
    { day: "2025-02-15", time: "10:00" },
    { day: "2025-02-16", time: "14:00" },
  ];

  // Generate time slots for whole hours (9:00 to 16:00)
  const generateTimeSlots = () => {
    const times = [];
    for (let hour = 9; hour <= 16; hour++) {
      times.push(`${hour}:00`);
    }
    return times;
  };

  // Check if the selected time and date is already taken
  const isTimeTaken = (date, time) => {
    return appointments.some(
      (appt) => appt.day === date && appt.time === time
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !brideFirstName || !brideLastName || !groomFirstName || !groomLastName || !email) {
      setError("Please fill in all required fields.");
      return;
    }

    const userId = Cookies.get("user_id");

    if (!userId) {
      setError("User ID is missing. Please log in again.");
      return;
    }

    const db = getFirestore(app);

    // Fetch fcmToken from the users collection using userId
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      setError("User not found. Please log in again.");
      return;
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      setError("FCM token is missing. Please log in again.");
      return;
    }

    // Combine first and last names
    const brideFullName = `${brideFirstName} ${brideLastName}`;
    const groomFullName = `${groomFirstName} ${groomLastName}`;

    try {
      // Add the appointment data to Firestore's "appointments" collection
      await addDoc(collection(db, "appointments"), {
        serviceId: "Service3", // The service ID for marriage certificates
        brideFullName,           // Save the full name of the bride
        groomFullName,           // Save the full name of the groom
        email,
        day: selectedDate,
        time: selectedTime,
        status: "waiting",       // Status set to "waiting"
        userId,                  // User ID from cookie
        fcmToken,                // Add the FCM token to the appointment
        isRead: false,           // Set isRead to false
        createdAt: new Date().toISOString(), // Timestamp for when the appointment was created
      });

      alert("Appointment successfully scheduled!");
    } catch (err) {
      console.error("Error scheduling appointment:", err);
      setError("Failed to schedule the appointment. Please try again.");
    }
  };

  // Helper function to generate the min and max date for the date picker
  const generateDateConstraints = () => {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // Get the current date in YYYY-MM-DD format
    return todayString;
  };

  return (
    <div>
      <h1>Marriage Certificate Appointment</h1>
      <form onSubmit={handleSubmit}>
        {/* Bride & Groom Details */}
        <div>
          <label>Bride First Name:</label>
          <input
            type="text"
            value={brideFirstName}
            onChange={(e) => setBrideFirstName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Bride Last Name:</label>
          <input
            type="text"
            value={brideLastName}
            onChange={(e) => setBrideLastName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Groom First Name:</label>
          <input
            type="text"
            value={groomFirstName}
            onChange={(e) => setGroomFirstName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Groom Last Name:</label>
          <input
            type="text"
            value={groomLastName}
            onChange={(e) => setGroomLastName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Date Input: Exclude Saturday and Sunday */}
        <div>
          <label>Select a Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={generateDateConstraints()} // Disable past dates
            required
            pattern="\\d{4}-\\d{2}-\\d{2}" // Ensure format is YYYY-MM-DD
            disabled={false}
          />
        </div>

        {/* Time Input: Allow only whole hour times */}
        {selectedDate && (
          <div>
            <label>Select Time:</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            >
              <option value="">-- Select Time --</option>
              {generateTimeSlots().map((time) => (
                <option
                  key={time}
                  value={time}
                  disabled={isTimeTaken(selectedDate, time)}
                >
                  {time} {isTimeTaken(selectedDate, time) ? "(Taken)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit">Submit Appointment</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default MarriageCertificateAppointment;
