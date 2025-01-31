import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, getFirestore, addDoc } from "firebase/firestore";
import Cookies from "js-cookie"; // Import js-cookie
import { app } from "../firebase";
import { sendPushNotification } from "../services/pushNotification"; // Adjust the path as necessary

const AppointmentPage = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [groomFullName, setGroomFullName] = useState("");
  const [brideFullName, setBrideFullName] = useState("");
  const [groomEmail, setGroomEmail] = useState("");
  const [brideEmail, setBrideEmail] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch services of category "appointment"
  const fetchServices = useCallback(async () => {
    const resolvedServices = [];
    const servicesRef = collection(getFirestore(app), "services");
    const querySnapshot = await getDocs(servicesRef);

    querySnapshot.forEach((doc) => {
      const serviceData = doc.data();
      // Only show services with category "Appointment"
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

  // Fetch the services when the component mounts
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Reset form state when hiding the form
  useEffect(() => {
    if (!showForm) {
      setGroomFullName("");
      setBrideFullName("");
      setGroomEmail("");
      setBrideEmail("");
      setFullName("");
      setEmail("");
      setSelectedDay("");
      setSelectedTime("");
      setError(null);
    }
  }, [showForm]);

  // Handle selecting a service
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowForm(true); // Show the form when a service is selected
  };

  // Generate time slots from 9:00 AM to 5:00 PM
  const generateTimeSlots = () => {
    const times = [];
    for (let hour = 9; hour <= 16; hour++) {
      const startHour = hour <= 12 ? hour : hour - 12;
      const endHour = (hour + 1) <= 12 ? (hour + 1) : (hour + 1) - 12;
      const startPeriod = hour < 12 ? "AM" : "PM";
      const endPeriod = (hour + 1) < 12 ? "AM" : "PM";
      const timeSlot = `${startHour}:00 ${startPeriod} - ${endHour}:00 ${endPeriod}`;
      times.push(timeSlot);
    }
    return times;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDay || !selectedTime) {
      setError("Please select a day and time.");
      return;
    }

    // Retrieve user_id from the cookie
    const userId = Cookies.get("user_id");

    if (!userId) {
      setError("User ID is missing. Please log in again.");
      return;
    }

    // Prepare appointment data
    const appointmentData = {
      serviceId: selectedService.id,
      day: selectedDay,
      time: selectedTime,
      isRead: false,
      user_id: userId, // Include user_id in the appointment data
      fcm_token: Cookies.get("fcm_token"), // Get user's FCM token
      kebele_id: Cookies.get("kebele_id"), // Use kebele_id from cookies
      subcity_id: Cookies.get("subcity_id"), // Use subcity_id from cookies
      submittedAt: new Date().toLocaleString(), 

    };

    // Additional data handling for marriage certificate
    if (selectedService.name === "Marriage certificate") {
      if (!groomFullName || !groomEmail || !brideFullName || !brideEmail) {
        setError("Please fill in all fields for the groom and bride.");
        return;
      }
      appointmentData.groomFullName = groomFullName;
      appointmentData.brideFullName = brideFullName;
      appointmentData.groomEmail = groomEmail;
      appointmentData.brideEmail = brideEmail;
    } else {
      if (!fullName || !email) {
        setError("Please fill in your full name and email.");
        return;
      }
      appointmentData.fullName = fullName;
      appointmentData.email = email;
    }

    try {
      const db = getFirestore(app);
      const appointmentsRef = collection(db, "appointments");

      await addDoc(appointmentsRef, appointmentData); // Save appointment data to Firestore

      // Send notification after successful appointment creation
      await sendPushNotification(appointmentData); // Call your notification function

      alert("Appointment successfully scheduled!");
      setShowForm(false); // Hide the form after submission
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
            <button key={service.id} onClick={() => handleServiceSelect(service)} style={{ margin: "10px", padding: "10px", fontSize: "16px" }}>
              <strong>{service.name}</strong>
            </button>
          ))
        ) : (
          <p>No appointment services available</p>
        )}
      </div>

      {showForm && selectedService && (
        <div>
          <form onSubmit={handleSubmit}>
            {selectedService.name === "Marriage certificate" ? (
              <>
                <div>
                  <label>Groom's Full Name:</label>
                  <input type="text" value={groomFullName} onChange={(e) => setGroomFullName(e.target.value)} required />
                </div>
                <div>
                  <label>Groom's Email:</label>
                  <input type="email" value={groomEmail} onChange={(e) => setGroomEmail(e.target.value)} required />
                </div>
                <div>
                  <label>Bride's Full Name:</label>
                  <input type="text" value={brideFullName} onChange={(e) => setBrideFullName(e.target.value)} required />
                </div>
                <div>
                  <label>Bride's Email:</label>
                  <input type="email" value={brideEmail} onChange={(e) => setBrideEmail(e.target.value)} required />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label>Full Name:</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>

                <div>
                  <label>Email:</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </>
            )}

            <div>
              <label>Available Days:</label>
              <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} required >
                <option value="">Select Day</option>
                {selectedService.availability?.map((availability, index) => (
                  <option key={index} value={availability.day}>
                    {availability.day}
                  </option>
                ))}
              </select>
            </div>

            {selectedDay && (
              <div>
                <label>Available Time:</label>
                <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} required >
                  <option value="">Select Time</option>
                  {generateTimeSlots().map((timeSlot, index) => (
                    <option key={index} value={timeSlot}>
                      {timeSlot}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit">Submit Appointment</button>

            {error && <p style={{ color: "red" }}>{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default AppointmentPage;
