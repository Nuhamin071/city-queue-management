import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, doc, query, where, getDocs, updateDoc, collection, getDoc } from "../firebase";
import CallTicket from "./CallTicket";
import AppointmentTable from "./AppointmentTable";
import Cookies from "js-cookie";

const StaffProfile = () => {
  const [staffStatus, setStaffStatus] = useState(false);
  const [assignedService, setAssignedService] = useState(null);
  const [staffNotFound, setStaffNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [staffId, setStaffId] = useState(null);
  const [subcityName, setSubcityName] = useState(null);
  const [kebeleName, setKebeleName] = useState(null);
  const [kebeleId, setKebeleId] = useState(Cookies.get("kebele_id") || null);
  const [subcityId, setSubcityId] = useState(Cookies.get("subcity_id") || null);
  const [serviceId, setServiceId] = useState(null);
  const navigate = useNavigate();

  const userId = Cookies.get("user_id");

  const updateStaffStatus = async (status) => {
    try {
      const staffRef = doc(db, "users", userId);
      await updateDoc(staffRef, { status: status ? "online" : "offline" });
      alert(`Staff status updated to ${status ? "online" : "offline"}`);
    } catch (err) {
      setError(`Error updating staff status: ${err.message}`);
    }
  };

  const toggleStatus = async () => {
    const newStatus = !staffStatus;
    setStaffStatus(newStatus);
    await updateStaffStatus(newStatus);
    if (!newStatus) navigate("/login");
  };

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const staffQuery = query(collection(db, "users"), where("user_id", "==", userId));
        const staffSnapshot = await getDocs(staffQuery);

        if (!staffSnapshot.empty) {
          const staffData = staffSnapshot.docs[0].data();
          setStaffStatus(staffData.status === "online");
          setStaffId(staffData.staff_id);
          
          if (staffData.assigned_service) {
            const serviceRef = doc(db, "services", staffData.assigned_service);
            const serviceSnapshot = await getDoc(serviceRef);
            if (serviceSnapshot.exists()) {
              setAssignedService(serviceSnapshot.data());
              setServiceId(serviceSnapshot.id);
            }
          }

          setSubcityName(staffData.subcity_name || "N/A");
          setKebeleName(staffData.kebele_name || "N/A");
          setKebeleId(staffData.kebele_id);
          setSubcityId(staffData.subcity_id);

          // Store subcity_id and kebele_id in cookies
          Cookies.set("subcity_id", staffData.subcity_id, { expires: 7 });
          Cookies.set("kebele_id", staffData.kebele_id, { expires: 7 });
        } else {
          setStaffNotFound(true);
        }
      } catch (err) {
        setError(`Error fetching staff data: ${err.message}`);
      }
    };

    if (userId) {
      fetchStaffData();
    } else {
      setStaffNotFound(true);
    }
  }, [userId]);

  if (staffNotFound) {
    return <p>Staff not found or user not logged in.</p>;
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
        <button onClick={toggleStatus}>{staffStatus ? "Go Offline" : "Go Online"}</button>
        <p>Status: {staffStatus ? "Online" : "Offline"}</p>
      </div>
      {staffStatus && (
        assignedService?.name === "Marriage Certificate" ? (
          <AppointmentTable kebeleId={kebeleId} subcityId={subcityId} serviceId={serviceId} />
        ) : (
          <CallTicket kebeleId={kebeleId} subcityId={subcityId} serviceId={serviceId} />
        )
      )}
    </div>
  );
};

export default StaffProfile;
