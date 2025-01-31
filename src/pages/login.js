import React, { useState } from "react";
import { Link } from "react-router-dom";
import useLoginHandler from "../hooks/useLoginHandler";
import "../styles/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, handleLogin] = useLoginHandler(email, password); // Use the custom hook for login logic

  return (
    <div className="form-container">
  <form onSubmit={handleLogin} className="form">
    <h2 className="form-title">Login</h2>
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
    <button type="submit" disabled={isLoading} className="form-button">Login</button>
    {isLoading && <p className="loading-text">Loading...</p>}
    <p className="signup-text">Don't have an account? <Link to="/signup">Sign Up</Link></p>
  </form>
</div>

  );
};

export default Login;
