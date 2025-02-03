import React, { useEffect, useState } from "react";
import useProfile from "../hooks/ProfileLogic";  
import Cookies from "js-cookie";  
import { generateToken } from "../firebase";
import "../styles/profile.css";
import RealtimeQueue from "./realtimeQueue";

const Profile = () => {
  const userId = Cookies.get("user_id");  

  // Language state: defaults to English
  const [language, setLanguage] = useState("en");

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

  // Function to toggle between English and Amharic
  const toggleLanguage = () => {
    setLanguage(language === "en" ? "am" : "en");
  };

  // Text in English and Amharic
  const texts = {
    en: {
      welcome: `Welcome, ${fullname}`,
      description: "Let's get started! Please provide your subcity and kebele.",
      subcityLabel: "Choose your Subcity:",
      kebeleLabel: "Please choose your kebele:",
      noKebeleMessage: "No kebeles found for this subcity.",
      enterButton: "Enter",
    },
    am: {
      welcome: `እንኳን ወደ ስም ማኅበረሰብ በሰላም መጡ, ${fullname}`,
      description: "በመጀመሪያ እባኮትን ስብስክና ቀበሌዎን ማስተናገድ አሁን በመጀመሪያ እባኮትን",
      subcityLabel: "ስብስክ እንዲሁ ይምረጡ:",
      kebeleLabel: "እባኮትን ቀበሌ ምረጡ:",
      noKebeleMessage: "ከዚህ በላይ ቀበሌዎች በስብስክ በተመዘገበ አላቸው።",
      enterButton: "ግባ",
    },
  };

  return (
    <div>
      <div> <RealtimeQueue/></div>
      <div className="profile-container">
        
        <h1>{texts[language].welcome}</h1>
        <p>{texts[language].description}</p>
        {error && <p className="error-message">{error}</p>}

        {/* Language Switch Button */}
        <button onClick={toggleLanguage} className="language-switch-button">
          {language === "en" ? "Switch to Amharic" : "Switch to English"}
        </button>
      
        <form onSubmit={handleProfileSubmit} className="profile-form">
          <label htmlFor="subcity">{texts[language].subcityLabel}</label>
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
  
          <p>{texts[language].kebeleLabel}</p>
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
            <h3 className="no-kebele-message">{texts[language].noKebeleMessage}</h3>
          )}
  
          <button type="submit" className="submit-button">{texts[language].enterButton}</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
