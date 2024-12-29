import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, getFirestore, addDoc } from "firebase/firestore";
import { app } from "../firebase";

const AppointmentPage = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null); // Selected service
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false); // To toggle form visibility

  // Fetch services that are of category "Appointment"
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
          availability: serviceData.availability, // Available days and times
        });
      }
    });

    setServices(resolvedServices);
  }, []);

  // Fetch the services when the component mounts
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Handle selecting a service
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowForm(true); // Show the appointment form after selecting a service
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !selectedDay || !selectedTime) {
      setError("Please fill in all fields.");
      return;
    }

    const kebeleId = localStorage.getItem("kebele_id");
    const subcityId = localStorage.getItem("subcity_id");
    const userId = localStorage.getItem("user_id");

    if (!kebeleId || !subcityId || !userId) {
      setError("Kebele ID or Subcity ID is missing.");
      return;
    }

    // Create appointment object
    const appointment = {
      serviceId: selectedService.id,
      fullName,
      email,
      day: selectedDay,
      time: selectedTime,
      kebele_id: kebeleId,
      subcity_id: subcityId,
      createdAt: new Date(), // You can store the date and time of creation if needed
    };

    try {
      // Add the appointment to Firestore
      const db = getFirestore(app);
      const appointmentsRef = collection(db, "appointments");
      await addDoc(appointmentsRef, appointment);
      
      // Clear the form and show success message
      setFullName("");
      setEmail("");
      setSelectedDay("");
      setSelectedTime("");
      setShowForm(false);
      alert("Appointment successfully scheduled!");
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

      {showForm && selectedService && (
        <div style={{ marginTop: "20px" }}>
          <h3>Schedule an Appointment for: {selectedService.name}</h3>

          <form onSubmit={handleSubmit}>
            <div>
              <label>Full Name:</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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

            <div>
              <label>Available Days:</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                required
              >
                <option value="">Select Day</option>
                {selectedService.availability.map((availability, index) => (
                  <option key={index} value={availability.day}>
                    {availability.day}
                  </option>
                ))}
              </select>
            </div>

            {selectedDay && (
              <div>
                <label>Available Time:</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                >
                  <option value="">Select Time</option>
                  {selectedService.availability
                    .find((avail) => avail.day === selectedDay)
                    ?.time.split(" - ")
                    .map((timeSlot, index) => (
                      <option key={index} value={timeSlot}>
                        {timeSlot}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <button type="submit">Submit Appointment</button>
          </form>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default AppointmentPage;
