import React, { useState, useEffect } from "react";
import { db, doc, query, where, getDocs, updateDoc, collection, getDoc } from "../firebase";
import CallTicket from "./CallTicket";

const StaffProfile = () => {
  const [staffStatus, setStaffStatus] = useState(false);
  const [assignedService, setAssignedService] = useState(null);
  const [staffNotFound, setStaffNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [staffId, setStaffId] = useState(null);
  const [subcityName, setSubcityName] = useState(null);
  const [kebeleName, setKebeleName] = useState(null);
  
  const [kebeleId, setKebeleId] = useState(null);
  const [subcityId, setSubcityId] = useState(null);
  const [serviceId, setServiceId] = useState(null);

  const userId = localStorage.getItem("user_id");

  // Update staff status (online/offline)
  const updateStaffStatus = async (status) => {
    try {
      const staffRef = doc(db, "users", userId);
      await updateDoc(staffRef, {
        status: status ? "online" : "offline",
      });
      alert(`Staff status updated to ${status ? "online" : "offline"}`);
    } catch (err) {
      setError(`Error updating staff status: ${err.message}`);
    }
  };

  const toggleStatus = async () => {
    const newStatus = !staffStatus;
    setStaffStatus(newStatus);
    await updateStaffStatus(newStatus);
  };

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const staffQuery = query(
          collection(db, "users"),
          where("role", "==", "staff"),
          where("user_id", "==", userId)
        );

        const staffSnapshot = await getDocs(staffQuery);

        if (!staffSnapshot.empty) {
          const staffData = staffSnapshot.docs[0].data();
          setStaffStatus(staffData.status === "online");
          setStaffId(staffData.staff_id);

          // Fetch the assigned service data if available
          if (staffData.assigned_service) {
            const serviceRef = doc(db, "services", staffData.assigned_service.id);
            const serviceSnapshot = await getDoc(serviceRef);

            if (serviceSnapshot.exists()) {
              setAssignedService(serviceSnapshot.data());
              setServiceId(serviceSnapshot.id);  // Set serviceId from the service data
            }
          }

          // Fetch subcity_name and kebele_name
          setSubcityName(staffData.subcity_name || "N/A");
          setKebeleName(staffData.kebele_name || "N/A");
          setKebeleId(staffData.kebele_id || "N/A");  // Store kebeleId
          setSubcityId(staffData.subcity_id || "N/A");  // Store subcityId
        } else {
          setStaffNotFound(true);
        }
      } catch (err) {
        setError(`Error fetching staff data: ${err.message}`);
      }
    };

    if (userId) {
      fetchStaffData();
    }
  }, [userId]);

  if (staffNotFound) {
    return <p>Staff not found.</p>;
  }

  return (
    <div>
      <h3>Staff Profile</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <p>Subcity: {subcityName} | Kebele: {kebeleName}</p>
        <p>Staff ID: {staffId || "N/A"}</p>
        <p>Assigned Service: {assignedService?.name || "N/A"}</p>
      </div>

      <div>
        <button onClick={toggleStatus}>
          {staffStatus ? "Go Offline" : "Go Online"}
        </button>
        <p>Status: {staffStatus ? "Online" : "Offline"}</p>
      </div>

      {/* Pass the values from state directly to CallTicket */}
      <CallTicket
        kebeleId={kebeleId}
        subcityId={subcityId}
        serviceId={serviceId}
      />
    </div>
  );
};

export default StaffProfile;
