import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, getFirestore, addDoc, query, where } from "firebase/firestore";
import Cookies from "js-cookie";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";

const AppointmentPage = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [takenDates, setTakenDates] = useState([]); // Store taken dates

  const navigate = useNavigate();

  const fetchServices = useCallback(async () => {
    const resolvedServices = [];
    const servicesRef = collection(getFirestore(app), "services");
    const querySnapshot = await getDocs(servicesRef);

    querySnapshot.forEach((doc) => {
      const serviceData = doc.data();
      if (serviceData.catagory === "appointment") {
        resolvedServices.push({
          id: doc.id,
          name: serviceData.name,
          availability: serviceData.availability || [],
        });
      }
    });

    setServices(resolvedServices);
  }, []);

  const fetchTakenDates = useCallback(async (serviceId) => {
    const db = getFirestore(app);
    const appointmentsRef = collection(db, "appointments");
    const q = query(appointmentsRef, where("serviceId", "==", serviceId));
    const querySnapshot = await getDocs(q);
    const dates = [];

    querySnapshot.forEach((doc) => {
      const appointmentData = doc.data();
      dates.push(appointmentData.date); // Collect all the taken dates for this service
    });

    setTakenDates(dates); // Update the taken dates state
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (selectedService) {
      fetchTakenDates(selectedService.id); // Fetch taken dates when service is selected
    }
  }, [selectedService, fetchTakenDates]);

  // Get the current date and exclude weekends (Saturday and Sunday)
  const getAvailableDates = () => {
    const today = new Date();
    const availableDates = [];
    const maxDaysInAdvance = 30; // You can set how far in advance appointments can be booked
    for (let i = 0; i < maxDaysInAdvance; i++) {
      let newDate = new Date(today);
      newDate.setDate(today.getDate() + i);
      const dayOfWeek = newDate.getDay();
      
      // Exclude Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const formattedDate = newDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
        if (!takenDates.includes(formattedDate)) { // Exclude taken dates
          availableDates.push(formattedDate);
        }
      }
    }
    return availableDates;
  };

  const handleServiceSelect = (service) => {
    if (service.name === "Marriage Certificate") {
      navigate("/marriage-appointment"); // Redirect if Marriage Certificate is selected
    } else {
      setSelectedService(service);
      setShowForm(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time.");
      return;
    }
  
    const userId = Cookies.get("user_id"); // You can still use cookies to store the user ID
    if (!userId) {
      setError("User ID is missing. Please log in again.");
      return;
    }
  
    // Fetch the fcm_token from Firestore using the user_id
    try {
      const db = getFirestore(app);
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("user_id", "==", userId));
      const userSnapshot = await getDocs(userQuery);
  
      if (userSnapshot.empty) {
        setError("User not found.");
        return;
      }
  
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      const fcmToken = userData.fcmToken; // Assuming fcm_token is a field in the user document
  
      const appointmentData = {
        serviceId: selectedService.id,
        isRead : false,
        date: selectedDate,
        time: selectedTime,
        user_id: userId,
        email,
        kebele_id: Cookies.get("kebele_id"),
        subcity_id: Cookies.get("subcity_id"),
        submittedAt: new Date().toLocaleString(),
        fcmToken: fcmToken, // Use the fetched fcm_token
      };
  
      // Save appointment to Firestore and send push notification
      const appointmentsRef = collection(db, "appointments");
      await addDoc(appointmentsRef, appointmentData); // Save appointment to Firestore
     
  
      alert("Appointment successfully scheduled!");
      setShowForm(false);
    } catch (err) {
      console.error("Error scheduling appointment:", err);
      setError("Failed to schedule the appointment. Please try again.");
    }
  };
  

  return (
    <div>
      <h1>Appointment Scheduling</h1>

      <h3>Select a Service</h3>

      <div>
        {services.length > 0 ? (
          services.map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              style={{ margin: "10px", padding: "10px", fontSize: "16px" }}
            >
              <strong>{service.name}</strong>
            </button>
          ))
        ) : (
          <p>No appointment services available</p>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              min={getAvailableDates()[0]} // Set minimum date to today's date
              max={getAvailableDates()[getAvailableDates().length - 1]} // Set maximum date
              // Disable weekends (Saturday and Sunday)
            />
            {/* Display if selected date is already taken */}
            {takenDates.includes(selectedDate) && (
              <p style={{ color: "red" }}>This date is already taken.</p>
            )}
          </div>

          {selectedDate && (
            <div>
              <label>Select Time:</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
                step="3600" // Restrict to whole hours (60 minutes intervals)
              />
            </div>
          )}

          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit">Submit Appointment</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}
    </div>
  );
};

export default AppointmentPage;
