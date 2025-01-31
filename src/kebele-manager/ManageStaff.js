import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import Cookies from "js-cookie";
import { Link } from "react-router-dom"; // Import Link for navigation

const ManageStaff = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch staff and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const subcityId = Number(Cookies.get("subcity_id"));
        const kebeleId = Number(Cookies.get("kebele_id"));

        if (!subcityId || !kebeleId) {
          throw new Error("Subcity ID or Kebele ID not found in cookies.");
        }

        // Fetch staff
        const staffQuery = query(
          collection(db, "users"),
          where("role", "==", "staff"),
          where("subcity_id", "==", subcityId),
          where("kebele_id", "==", kebeleId)
        );
        const staffSnapshot = await getDocs(staffQuery);
        const staffList = staffSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          assigned_service: doc.data().assigned_service || "", // Set the initial assigned_service value
        }));

        setStaffMembers(staffList);

        // Fetch services
        const servicesQuery = query(collection(db, "services"));
        const servicesSnapshot = await getDocs(servicesQuery);
        const servicesList = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));

        setServices(servicesList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle staff assignment
  const handleAssignService = async (staffId, serviceId) => {
    try {
      const staffRef = doc(db, "users", staffId);
      await updateDoc(staffRef, {
        assigned_service: serviceId, // Assign the service by ID
      });
      alert("Service assigned successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Manage Staff Assignments</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
       

      <Link to="/kebele-manager/AddStaff">
        <button>+ Add Staff</button>
      </Link>

      {/* List of staff members */}
      <ul>
        {staffMembers.map((staff) => (
          <li key={staff.id}>
            <p>{staff.fullname}</p>

            {/* Dropdown to select a service for this staff */}
            <div>
              <label>Select Service for {staff.fullname}: </label>
              <select
                value={staff.assigned_service || ""}
                onChange={(e) => {
                  const updatedStaff = staffMembers.map((s) =>
                    s.id === staff.id ? { ...s, assigned_service: e.target.value } : s
                  );
                  setStaffMembers(updatedStaff);
                }}
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Button to assign the selected service */}
            <button onClick={() => handleAssignService(staff.id, staff.assigned_service)}>
              Assign to {staff.assigned_service ? services.find((s) => s.id === staff.assigned_service).name : "a service"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageStaff;
