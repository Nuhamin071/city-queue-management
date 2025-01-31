import React, { useState } from "react";
import { Link } from "react-router-dom";
import useSignUpHandler from "../hooks/useSignHandler"; // Import the custom hook
import "../styles/signup.css"; // Move styles to a CSS file
const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  
  const { isLoading, handleSignUp } = useSignUpHandler(email, password, fullname);

  return (
    <div className="form-container">
  <form onSubmit={handleSignUp} className="form">
    <h2 className="form-title">Sign Up</h2>
    <input
      type="text"
      placeholder="Full Name"
      value={fullname}
      onChange={(e) => setFullname(e.target.value)}
      className="form-input"
    />
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="form-input"
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="form-input"
    />
    <button type="submit" disabled={isLoading} className="form-button">Sign Up</button>
    {isLoading && <p className="loading-text">Loading...</p>}
    <p className="login-text">Already have an account? <Link to="/login">Login</Link></p>
  </form>
</div>

  );
};

export default Signup;
