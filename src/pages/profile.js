import React from "react";
import { Link } from "react-router-dom";
import useProfile from "../hooks/ProfileLogic";  // Import the custom hook
import Cookies from "js-cookie";  // Import js-cookie for cookie management

const Profile = () => {
  // Get user_id from cookie
  const userId = Cookies.get("user_id");  // Get user_id from cookies

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
  } = useProfile(userId);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Filter kebeles based on the selected subcityId
  const filteredKebeles = kebelesList.filter((kebele) => kebele.subcity_id === parseInt(subcityId));

  const handleProfileSubmit = (event) => {
    handleSubmit(event);  // Call the handleSubmit function from the custom hook

    // Save subcity_id and kebele_id to cookies
    Cookies.set("subcity_id", subcityId, { expires: 7 });  // Set subcity_id in cookie (expires in 7 days)
    Cookies.set("kebele_id", kebeleName, { expires: 7 });  // Set kebele_name in cookie (expires in 7 days)
  };

  return (
    <div>
   <Link to="/logout">
  <button className="welcome-button">LogOut</button>
   </Link>
      <h1>Welcome, {fullname}</h1>
      <p> Lets get started Please provide your subcity and kebele.</p>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleProfileSubmit}> {/* Use custom submit handler */}
        <label htmlFor="subcity">Choose your Subcity:</label>
        <select
          id="subcity"
          value={subcityId}
          onChange={(e) => setSubcityId(Number(e.target.value))} // Use the setter here
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
          value={kebeleName}
          onChange={handleKebeleChange}  // Update kebeleName and kebeleId
        >
          <option value="">Select Kebele</option>
          {filteredKebeles.map((kebele) => (
            <option key={kebele.kebele_id} value={kebele.kebele_name}>
              {kebele.kebele_name}
            </option>
          ))}
        </select>

        {filteredKebeles.length === 0 && (
          <p>No kebeles found for this subcity.</p>
        )}

        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;
