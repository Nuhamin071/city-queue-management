import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RealtimeQueue from "./realtimeQueue";
import QueueJoined from "./QueueJoined"; // Import the QueueJoined component
import useKebeleProfileData from "../hooks/useKebeleProfileData"; // Import custom hook for fetching data
import Cookies from "js-cookie"; // Import js-cookie

const KebeleProfile = () => {
  const { kebeleData, subcityData, services, loading, error } = useKebeleProfileData();
  const [selectedService, setSelectedService] = useState(null); 
  const [showPopup, setShowPopup] = useState(false); 
  const navigate = useNavigate();

  // Get data from cookies instead of localStorage
  const userId = Cookies.get("user_id");
  const kebeleId = Cookies.get("kebele_id");
  const subcityId = Cookies.get("subcity_id");

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedService(null);
  };

  const handleAppointment = () => {
    navigate("/AppointmentPage");
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div>
          <div style={{ position: "absolute", right: "10px", top: "20px" }}>
            <RealtimeQueue
              userId={userId}
              kebeleId={kebeleId}
              subcityId={subcityId}
            />
          </div>

          <h1> {kebeleData ? kebeleData.kebele_name : "Kebele"} Administrative Service</h1>
          <p>Region: {subcityData ? subcityData.Region : "Loading..."}</p>
          <p>Subcity: {subcityData ? subcityData.subcity_name : "Loading..."}</p>

          <h2>Established Kebele: {kebeleData ? kebeleData.kebele_name : "Not available"}</h2>
          <p>Join and make an appointment with multiple of our services</p>

          <h3>Services Offered:</h3>

          <ul>
            <div>
              <button onClick={handleAppointment}>Make Appointment</button>
            </div>
            {services.length > 0 ? (
              services.map((service) => (
                <button key={service.key} onClick={() => handleServiceClick(service)}>
                  <strong>{service.name}</strong> - Status: {service.status}
                  {service.peopleJoined && <span> - {service.peopleJoined} people joined</span>}
                </button>
              ))
            ) : (
              <li>No services available</li>
            )}
          </ul>

          {showPopup && selectedService && (
            <QueueJoined
              service={selectedService}
              onClose={handleClosePopup}
              userId={userId}
              kebeleId={kebeleId}
              subcityId={subcityId}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default KebeleProfile;
