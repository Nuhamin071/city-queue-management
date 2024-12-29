import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const KebeleManager = () => {
  const [managerData, setManagerData] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Kebele Manager Data
  const fetchManagerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = localStorage.getItem("user_id");
      if (!userId) throw new Error("User ID not found in localStorage.");

      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) throw new Error("Manager data not found.");

      const userData = userDoc.data();
      setManagerData(userData);

      return {
        kebeleId: userData.kebele_id,
        subcityId: userData.subcity_id,
      };
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Staff Based on Kebele and Subcity
  const fetchStaffData = useCallback(async (kebeleId, subcityId) => {
    try {
      setLoading(true);
      setError(null);
  
      const staffQuery = query(
        collection(db, "users"),
        where("kebele_id", "==", kebeleId),
        where("subcity_id", "==", subcityId),
        where("role", "==", "staff") // Add this condition
      );
  
      const staffSnapshot = await getDocs(staffQuery);
      const staffList = staffSnapshot.docs.map((doc) => doc.data());
      setStaffData(staffList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  

  useEffect(() => {
    const loadManagerData = async () => {
      const managerData = await fetchManagerData();
      if (managerData) {
        fetchStaffData(managerData.kebeleId, managerData.subcityId);
      }
    };

    loadManagerData();
  }, [fetchManagerData, fetchStaffData]);

  if (loading) return <p>Loading...</p>;

  if (error) {
    return (
      <div style={{ color: "red" }}>
        <p>Error: {error}</p>
        <button onClick={() => fetchManagerData()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {managerData && (
        <>
          <h1>Kebele Manager Dashboard</h1>
          <h2>Welcome, {managerData.fullname}</h2>
          <p>Subcity ID: {managerData.subcity_id}</p>
          <p>Kebele ID: {managerData.kebele_id}</p>

          <h3>Staff Status:</h3>
          {staffData.length > 0 ? (
            <ul>
              {staffData.map((staff, index) => (
                <li key={index}>
                  <p>{staff.fullname}</p>
                  <p>Status: {staff.status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No staff found for this Kebele and Subcity.</p>
          )}
        </>
      )}
    </div>
  );
};

export default KebeleManager;
