import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RealtimeQueue from "./realtimeQueue";
import QueueJoined from "./QueueJoined"; // Import the QueueJoined component
import useKebeleProfileData from "../hooks/useKebeleProfileData"; // Import custom hook for fetching data
import Cookies from "js-cookie"; // Import js-cookie
import "../styles/KebeleProfile.css";

const KebeleProfile = () => {
  const { subcityData, services, loading, error } = useKebeleProfileData();
  const [selectedService, setSelectedService] = useState(null); 
  const [showPopup, setShowPopup] = useState(false); 
  const navigate = useNavigate();

  // Get data from cookies instead of localStorage
  const [userId, setUserId] = useState(Cookies.get("user_id"));
  const [kebeleId, setKebeleId] = useState(Cookies.get("kebele_id"));
  const [subcityId, setSubcityId] = useState(Cookies.get("subcity_id"));
  const [kebeleName, setKebeleName] = useState(Cookies.get("kebele_name"));

  useEffect(() => {
  const userId = Cookies.get("user_id");
  const kebeleId = Cookies.get("kebele_id");
  const subcityId = Cookies.get("subcity_id");
    const kebeleName = Cookies.get("kebele_name");
    console.log("Kebele Name Updated:", kebeleName);
    console.log("Cookies Read - userId:", userId, "kebeleId:", kebeleId, "subcityId:", subcityId, "kebeleName:", kebeleName);
  
    setUserId(userId);
    setKebeleId(kebeleId);
    setSubcityId(subcityId);
    setKebeleName(kebeleName);
  }, []);
  

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

          <div className="gov-profile">
          <div className="profile-header">
         <img
      src="/path-to-logo.png"
      alt="Government Logo"
      className="gov-logo"
    />
    <div className="profile-title">
      <h1>{kebeleName ? kebeleName : "Kebele"} Administrative Service</h1>
      <p>Region: {subcityData ? subcityData.Region : "Loading..."}</p>
      <p>Subcity: {subcityData ? subcityData.subcity_name : "Loading..."}</p>
    </div>
  </div>

  <div className="profile-info">
    <h2>Established Kebele: {kebeleName ? kebeleName : "Not available"}</h2>
    <p>Join and make an appointment with multiple of our services.</p>
  </div>

  <div className="services-section">
    <h3>Services Offered:</h3>
    <button className="appointment-button" onClick={handleAppointment}>
      Make Appointment
    </button>

    <div className="services-grid">
      {services.length > 0 ? (
        services.map((service) => (
          <div key={service.key} className="service-item">
            <button
              className="service-button"
              onClick={() => handleServiceClick(service)}
            >
              <strong>{service.name}</strong>
              <p
                className={`service-status ${
                  service.status === "Unavailable" ? "status-unavailable" : ""
                }`}
              >
                {service.status}
              </p>
              {service.peopleJoined && (
                <span>{service.peopleJoined} people joined</span>
              )}
            </button>
          </div>
        ))
      ) : (
        <p>No services available</p>
      )}
    </div>
  </div>

  <div className="profile-footer">
    <p>For inquiries, contact us at: admin@kebele-service.gov</p>
    <p>&copy; {new Date().getFullYear()} Government Services. All rights reserved.</p>
  </div>
</div>

  



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
