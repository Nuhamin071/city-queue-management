import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { db } from "../firebase";
import { query, collection, where, getDocs, limit, startAfter } from "firebase/firestore";
import "../styles/Table.css"; // Move styles to a CSS file

const StaffMembers = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [services, setServices] = useState([]); // To store services
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null); // Track last visible document
  const [hasMore, setHasMore] = useState(true); // To track if there are more staff to load

  // Memoize the fetchStaffMembers function to avoid unnecessary re-renders
  const fetchStaffMembers = useCallback(async () => {
    try {
      console.log("Fetching staff members...");
      setLoading(true);
      setError(null);

      const subcityId = Number(Cookies.get("subcity_id"));
      const kebeleId = Number(Cookies.get("kebele_id"));

      if (!subcityId || !kebeleId) {
        throw new Error("Subcity ID or Kebele ID not found in cookies.");
      }

      let staffQuery = query(
        collection(db, "users"),
        where("role", "==", "staff"),
        where("subcity_id", "==", subcityId),
        where("kebele_id", "==", kebeleId),
        limit(10) // Limit results per page (adjust as needed)
      );

      if (lastVisible) {
        console.log("Fetching more staff...");
        staffQuery = query(staffQuery, startAfter(lastVisible)); // Pagination support
      }

      const staffSnapshot = await getDocs(staffQuery);
      const staffList = staffSnapshot.docs.map((doc) => ({
        id: doc.id,
        fullname: doc.data().fullname,
        status: doc.data().status,
        assigned_service: doc.data().assigned_service || "", // Set the initial assigned_service value
      }));

      console.log("Staff fetched:", staffList);

      // Check if there are more staff to load
      if (staffSnapshot.docs.length < 10) {
        setHasMore(false);
      }

      // Prevent duplicates by checking existing staff members
      setStaffMembers((prevStaff) => {
        const newStaff = staffList.filter(
          (newStaffMember) => !prevStaff.some((existingStaff) => existingStaff.id === newStaffMember.id)
        );
        console.log("New staff added:", newStaff);
        return [...prevStaff, ...newStaff]; // Add only new staff
      });

      // Update the lastVisible for pagination
      if (staffSnapshot.docs.length > 0) {
        setLastVisible(staffSnapshot.docs[staffSnapshot.docs.length - 1]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [lastVisible]); // Memoizing the function with 'lastVisible' as the dependency

  // Memoize the fetchServices function as well
  const fetchServices = useCallback(async () => {
    try {
      const servicesQuery = query(collection(db, "services"));
      const servicesSnapshot = await getDocs(servicesQuery);
      const servicesList = servicesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setServices(servicesList);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    console.log("Component mounted. Fetching data...");
    fetchStaffMembers();
    fetchServices(); // Fetch services when the component mounts
  }, [fetchStaffMembers, fetchServices]); // Adding memoized functions as dependencies

  const loadMoreStaff = () => {
    // Only load more if there are more staff and we're not already loading
    if (hasMore && !loading) {
      fetchStaffMembers(); // Call fetchStaffMembers when more staff needs to be loaded
    }
  };

  if (loading) return <p>Loading staff members...</p>;

  if (error) {
    return (
      <div style={{ color: "red" }}>
        <p>Error: {error}</p>
        <button onClick={() => setLoading(true)}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Staff Members</h1>
      {staffMembers.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Assigned Service</th>
            </tr>
          </thead>
          <tbody>
            {staffMembers.map((staff, index) => {
              // Find the service by the assigned_service ID
              const selectedService = services.find(
                (service) => service.id === staff.assigned_service
              );
              return (
                <tr key={index}>
                  <td>{staff.fullname}</td>
                  <td>{staff.status}</td>
                  <td>
                    {selectedService
                      ? selectedService.name
                      : staff.assigned_service
                      ? "Unknown Service"
                      : "Not Assigned"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No staff members found for this Kebele and Subcity.</p>
      )}

      {/* Button to load more staff members */}
      {hasMore && (
        <button onClick={loadMoreStaff}>Load More</button>
      )}
    </div>
  );
};

export default StaffMembers;
