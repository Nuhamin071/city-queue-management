import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs, getDoc, getFirestore, onSnapshot } from "firebase/firestore";
import { app } from "../firebase";
import Cookies from "js-cookie";

const useKebeleProfileData = () => {
  const [kebeleData, setKebeleData] = useState(null);
  const [subcityData, setSubcityData] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKebeleData = useCallback(async (kebeleId) => {
    const kebeleRef = collection(getFirestore(app), "kebele");
    const q = query(kebeleRef, where("kebele_id", "==", kebeleId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const kebele = querySnapshot.docs[0].data();
      setKebeleData(kebele);
      return kebele; // Return kebele data
    } else {
      throw new Error(`No kebele found for kebele_id: ${kebeleId}`);
    }
  }, []);

  const fetchSubcityData = useCallback(async (subcityId) => {
    const subcityRef = collection(getFirestore(app), "subcity");
    const q = query(subcityRef, where("subcity_id", "==", subcityId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const subcity = querySnapshot.docs[0].data();
      setSubcityData(subcity);
      return subcity; // Return subcity data
    } else {
      throw new Error(`No subcity found for subcity_id: ${subcityId}`);
    }
  }, []);

  const fetchServices = useCallback(async (servicesOffered, kebele, subcity) => {
    const resolvedServices = [];

    // Listen to changes in the queue in real-time
    for (const [serviceKey, serviceData] of Object.entries(servicesOffered)) {
      const serviceRef = serviceData.ref;
      const serviceSnapshot = await getDoc(serviceRef);

      if (serviceSnapshot.exists()) {
        const serviceDetails = serviceSnapshot.data();
        if (serviceDetails.catagory === "Normal") {
          const queueRef = collection(getFirestore(app), "queue");
          const q = query(
            queueRef,
            where("kebele_id", "==", kebele.kebele_id),
            where("subcity_id", "==", subcity.subcity_id),
            where("service_id", "==", serviceKey),
            where("status", "==", "waiting")
          );

          // Set up real-time listener for queue changes
          onSnapshot(q, (queueSnapshot) => {
            const peopleJoined = queueSnapshot.size;

            resolvedServices.push({
              key: serviceKey,
              name: serviceDetails.name,
              status: serviceData.status,
              peopleJoined,
            });

            setServices((prevServices) => {
              // Update or add the service to the list
              const updatedServices = prevServices.filter((service) => service.key !== serviceKey);
              updatedServices.push({
                key: serviceKey,
                name: serviceDetails.name,
                status: serviceData.status,
                peopleJoined,
              });
              return updatedServices;
            });
          });
        }
      }
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const kebeleId = Number(Cookies.get("kebele_id"));
      const subcityId = Number(Cookies.get("subcity_id"));

      if (!kebeleId || !subcityId) {
        throw new Error("Kebele ID or Subcity ID is missing. Please log in again.");
      }

      const [kebele, subcity] = await Promise.all([
        fetchKebeleData(kebeleId),
        fetchSubcityData(subcityId),
      ]);

      await fetchServices(kebele.services_offered, kebele, subcity);
      setLoading(false);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  }, [fetchKebeleData, fetchSubcityData, fetchServices]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { kebeleData, subcityData, services, loading, error };
};

export default useKebeleProfileData;
