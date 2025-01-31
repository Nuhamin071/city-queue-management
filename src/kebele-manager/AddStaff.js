import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, getDocs, doc, setDoc, where } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Cookies from "js-cookie";


const AddStaff = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // For authentication
  const [assigned_service, setAssignedService] = useState("");
  const [services, setServices] = useState([]); // State to hold services
  const [subcityName, setSubcityName] = useState("");
  const [kebeleName, setKebeleName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // Fetch subcity_name and kebele_name based on subcity_id and kebele_id
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const subcityId = Number(Cookies.get("subcity_id"));
        const kebeleId = Number(Cookies.get("kebele_id"));

        if (!subcityId || !kebeleId) {
          throw new Error("Subcity ID or Kebele ID not found in cookies.");
        }

        // Fetch subcity_name
        const subcityQuery = query(collection(db, "subcity"), where("id", "==", subcityId));
        const subcitySnapshot = await getDocs(subcityQuery);
        if (!subcitySnapshot.empty) {
          setSubcityName(subcitySnapshot.docs[0].data().name);
        }

        // Fetch kebele_name based on kebele_id field
        const kebeleQuery = query(collection(db, "kebele"), where("kebele_id", "==", kebeleId));
        const kebeleSnapshot = await getDocs(kebeleQuery);
        if (!kebeleSnapshot.empty) {
          setKebeleName(kebeleSnapshot.docs[0].data().kebele_name);
        }
      } catch (err) {
        console.error("Error fetching location data:", err.message);
        setError(err.message);
      }
    };

    fetchLocationData();
  }, []);

  // Fetch services for the dropdown
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesQuery = query(collection(db, "services"));
        const servicesSnapshot = await getDocs(servicesQuery);
        const servicesList = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        
        setServices(servicesList); // Set services state
      } catch (err) {
        console.error("Error fetching services:", err.message);
      }
    };

    fetchServices();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create a new user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate a unique staff ID (you can customize this logic)
      const staffId = `staff-${Date.now()}`;

      // Store staff details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullname,
        email,
        assigned_service,
        subcity_id: Number(Cookies.get("subcity_id")),
        subcity_name: subcityName,
        kebele_id: Number(Cookies.get("kebele_id")),
        kebele_name: kebeleName,
        role: "staff",
        status: "offline", // Default status
        user_id: user.uid,
        staff_id: staffId,
      });

      alert("Staff member added successfully!");
      

      // Clear form fields
      setFullname("");
      setEmail("");
      setPassword("");
      setAssignedService("");
    } catch (err) {
      console.error("Error adding staff member:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Add New Staff Member</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label>
          <input
            type="text"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Assigned Service:</label>
          <select 
            value={assigned_service} 
            onChange={(e) => setAssignedService(e.target.value)} 
            required
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Staff"}
        </button>
      </form>
    </div>
  );
};

export default AddStaff;
