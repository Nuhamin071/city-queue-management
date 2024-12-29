import { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import Cookies from "js-cookie";  // Import js-cookie for cookie management
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const useProfile = (userId) => {
  const [subcityId, setSubcityId] = useState("");
  const [kebeleName, setKebeleName] = useState("");
  const [kebeleId, setKebeleId] = useState(null);  
  const [fullname, setFullname] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subcitiesList, setSubcitiesList] = useState([]);
  const [kebelesList, setKebelesList] = useState([]);
  
  const navigate = useNavigate(); // Initialize the navigate function

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFullname(userData.fullname);
          setSubcityId(userData.subcity_id || "");
          setKebeleName(userData.kebele_name || "");
        } else {
          setError("User not found.");
        }
      } catch (error) {
        setError("Error fetching user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    const fetchSubcitiesAndKebeles = async () => {
      try {
        const subcitiesRef = collection(db, "subcity");
        const kebelesRef = collection(db, "kebele");
        const subcitiesSnapshot = await getDocs(subcitiesRef);
        const kebelesSnapshot = await getDocs(kebelesRef);

        const subcitiesData = subcitiesSnapshot.docs.map(doc => doc.data());
        const kebelesData = kebelesSnapshot.docs.map(doc => doc.data());

        setSubcitiesList(subcitiesData);
        setKebelesList(kebelesData);
      } catch (error) {
        setError("Error fetching subcities or kebeles.");
      }
    };

    fetchSubcitiesAndKebeles();
  }, []);

  const handleKebeleChange = (event) => {
    const selectedKebeleName = event.target.value;
    setKebeleName(selectedKebeleName);
  
    // Search for the kebele_id based on the selected kebele_name
    const selectedKebele = kebelesList.find(
      (kebele) => kebele.kebele_name === selectedKebeleName
    );
  
    if (selectedKebele) {
      setKebeleId(selectedKebele.kebele_id);  // Update kebele_id
    } else {
      setKebeleId(null);  // If no kebele found, set kebele_id to null
      console.error('Kebele not found for the selected name.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate inputs before submitting
    if (!subcityId || !kebeleName || !kebeleId) {
      setError("Both subcity and kebele names are required.");
      return;
    }

    try {
      const userRef = doc(db, "users", userId);

      // Fetch the selected subcity name
      const selectedSubcity = subcitiesList.find(city => city.subcity_id === parseInt(subcityId));
      if (!selectedSubcity) {
        setError("Invalid subcity selected.");
        return;
      }
      const subcityName = selectedSubcity.subcity_name;

      await updateDoc(userRef, {
        subcity_id: subcityId,
        subcity_name: subcityName,
        kebele_name: kebeleName,
        kebele_id: kebeleId,
      });

      // Store data in cookies instead of localStorage
      Cookies.set("subcity_id", subcityId, { secure: true, sameSite: "Strict" });
      Cookies.set("subcity_name", subcityName, { secure: true, sameSite: "Strict" });
      Cookies.set("kebele_name", kebeleName, { secure: true, sameSite: "Strict" });
      Cookies.set("kebele_id", kebeleId, { secure: true, sameSite: "Strict" });

      console.log("Profile updated successfully!");

      // Navigate to KebeleProfile after submission
      navigate("/KebeleProfile");  
    } catch (error) {
      setError("Error updating profile.");
    }
  };

  // Return necessary state and handlers
  return {
    fullname,
    subcityId,
    kebeleName,
    kebeleId,
    loading,
    error,
    subcitiesList,
    kebelesList,
    handleKebeleChange,
    handleSubmit,
    setSubcityId,  // Make sure this is returned
  };
};

export default useProfile;
