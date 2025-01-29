import React, { useEffect } from "react";
import useProfile from "../hooks/ProfileLogic";  
import Cookies from "js-cookie";  
import { generateToken } from "../firebase";
import"../styles/profile.css";
import RealtimeQueue from "./realtimeQueue";

const Profile = () => {
  const userId = Cookies.get("user_id");  

  // Destructure the returned values from the custom hook
  const {
      fullname,
      subcityId,
      kebeleName,
      loading,
      error,
      subcitiesList,
      kebelesList,
      handleKebeleChange,
      handleSubmit,
      setSubcityId,
      setKebeleName // Ensure this is destructured here
  } = useProfile(userId);

  useEffect(() => {
    
  }, [setSubcityId, handleKebeleChange]);

  if (loading) {
      return <div>Loading...</div>;
  }

  const parsedSubcityId = parseInt(subcityId);
  const filteredKebeles = kebelesList.filter((kebele) => kebele.subcity_id === parsedSubcityId);

  const handleProfileSubmit = async (event) => {
      event.preventDefault(); 

      try {
          await handleSubmit(event);  
          Cookies.set("subcity_id", subcityId, { expires: 7 });  
          Cookies.set("kebele_name", kebeleName, { expires: 7 });  
          await generateToken();
          console.log("FCM token generated and stored.");
      } catch (error) {
          console.error("Error during profile update:", error);
          // You can also set an error state here to display an error message to the user
      }
  };

  return (
    
    <div>
        <div> <RealtimeQueue/></div>
    <div className="profile-container">
        
     <h1>Welcome, {fullname}</h1>
     <p>Let's get started! Please provide your subcity and kebele.</p>
     {error && <p className="error-message">{error}</p>}
  
     <form onSubmit={handleProfileSubmit} className="profile-form">
      <label htmlFor="subcity">Choose your Subcity:</label>
      <select
        id="subcity"
        value={subcityId || ""}
        onChange={(e) => {
          setSubcityId(Number(e.target.value));
          setKebeleName(""); // Reset kebele name when subcity changes
        }}
        className="dropdown"
      >
        <option value="">Select Subcity</option>
        {subcitiesList.map((city) => (
          <option key={city.subcity_id} value={city.subcity_id}>
            {city.subcity_name} ({city.Region})
          </option>
        ))}
      </select>
  
      <p>Please choose your kebele:</p>
      <select
        id="kebele"
        value={kebeleName || ""}
        onChange={handleKebeleChange}
        className="dropdown"
      >
        <option value="">Select Kebele</option>
        {filteredKebeles.map((kebele) => (
          <option key={kebele.kebele_id} value={kebele.kebele_name}>
            {kebele.kebele_name}
          </option>
        ))}
      </select>
  
      {filteredKebeles.length === 0 && (
        <h3 className="no-kebele-message">No kebeles found for this subcity.</h3>
      )}
  
      <button type="submit" className="submit-button">Enter</button>
     </form>
    </div>
    </div>
  
  );
};

export default Profile;
