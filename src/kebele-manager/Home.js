import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { db } from "../firebase";
import { doc, getDoc} from "firebase/firestore";

const Home = () => {
  const [managerData, setManagerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Kebele Manager Data
  const fetchManagerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = Cookies.get("user_id");
      if (!userId) throw new Error("User ID not found in cookies.");

      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) throw new Error("Manager data not found.");

      const userData = userDoc.data();
      setManagerData(userData);
      Cookies.set("subcity_id", userData.subcity_id);
      Cookies.set("kebele_id", userData.kebele_id);
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

  useEffect(() => {
    const loadManagerData = async () => {
      const managerData = await fetchManagerData();
      if (managerData) {
        // We don't need to fetch staff data anymore
      }
    };

    loadManagerData();
  }, [fetchManagerData]);

  if (loading) return <p>Loading...</p>;

  if (error) {
    return (
      <div style={{ color: "red" }}>
        <p>Error: {error}</p>
        <button onClick={fetchManagerData}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {managerData && (
        <>
          <h1>Kebele Manager Dashboard</h1>
          <h2>Welcome, {managerData.fullname}</h2>
          <p>Subcity: {managerData.subcity_id}</p>
          <p>Kebele: {managerData.kebele_id}</p>
        </>
      )}
    </div>
  );
};

export default Home;
