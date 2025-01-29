import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { db } from "../firebase";
import { doc, getDoc, query, where, collection, getDocs, updateDoc } from "firebase/firestore";

const Department = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Kebele Data using subcity_id and kebele_id from cookies
  const fetchKebeleData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const subcityId = Number(Cookies.get("subcity_id"));
const kebeleId = Number(Cookies.get("kebele_id"));

      if (!subcityId || !kebeleId) throw new Error("Subcity ID or Kebele ID not found in cookies.");

      // Query kebele_collection with subcity_id and kebele_id
      const kebeleQuery = query(
        collection(db, "kebele"),
        where("subcity_id", "==", subcityId),
        where("kebele_id", "==", kebeleId)
      );

      const kebeleSnapshot = await getDocs(kebeleQuery);


      if (kebeleSnapshot.empty) throw new Error("No matching kebele found.");
      

      const kebeleData = kebeleSnapshot.docs[0].data();

      // Extract services_offered
      const servicesOffered = kebeleData.services_offered
        ? await Promise.all(
            Object.entries(kebeleData.services_offered).map(async ([serviceKey, serviceData]) => {
              const serviceDoc = await getDoc(serviceData.ref);
              const serviceName = serviceDoc.exists() ? serviceDoc.data().name : serviceKey; // Fallback to key if no name
              return {
                id: serviceKey,
                name: serviceName,
                ref: serviceData.ref,
                status: serviceData.status,
              };
            })
          )
        : [];

      setServices(servicesOffered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle Service Availability
  const toggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      // Optimistically update the state
      const updatedStatus = currentStatus === "Available" ? "Unavailable" : "Available";
      setServices((prevServices) =>
        prevServices.map((service) =>
          service.id === serviceId ? { ...service, status: updatedStatus } : service
        )
      );

      const subcityId = Cookies.get("subcity_id");
      const kebeleId = Cookies.get("kebele_id");

      if (!subcityId || !kebeleId) throw new Error("Subcity ID or Kebele ID not found in cookies.");

      // Query kebele with subcity_id and kebele_id
      const kebeleQuery = query(
        collection(db, "kebele"),
        where("subcity_id", "==", subcityId),
        where("kebele_id", "==", kebeleId)
      );

      const kebeleSnapshot = await getDocs(kebeleQuery);

      if (kebeleSnapshot.empty) throw new Error("No matching kebele found.");

      const kebeleDoc = kebeleSnapshot.docs[0];
      const kebeleData = kebeleDoc.data();

      if (!kebeleData.services_offered[serviceId]) throw new Error("Service not found.");

      // Update the service status in Firestore
      const updatedServices = {
        ...kebeleData.services_offered,
        [serviceId]: {
          ...kebeleData.services_offered[serviceId],
          status: updatedStatus,
        },
      };

      await updateDoc(doc(db, "kebele", kebeleDoc.id), {
        services_offered: updatedServices,
      });
    } catch (err) {
      setError(err.message);

      // Rollback the UI state if the update fails
      setServices((prevServices) =>
        prevServices.map((service) =>
          service.id === serviceId
            ? { ...service, status: currentStatus } // Revert to previous status
            : service
        )
      );
    }
  };

  useEffect(() => {
    fetchKebeleData();
  }, [fetchKebeleData]);

  if (loading) return <p>Loading...</p>;

  if (error) {
    return (
      <div style={{ color: "red" }}>
        <p>Error: {error}</p>
        <button onClick={fetchKebeleData}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Department Management</h1>
      {services.length > 0 ? (
        <ul>
          {services.map((service) => (
            <li key={service.id}>
              <p>Service: {service.name}</p>
              <p>Status: {service.status}</p>
              <button onClick={() => toggleServiceStatus(service.id, service.status)}>
                {service.status === "Available" ? "Make Unavailable" : "Make Available"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No services found for this kebele.</p>
      )}
    </div>
  );
};

export default Department;
