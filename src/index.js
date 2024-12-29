// utils/index.js or wherever your entry point is
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Adjust path based on your structure

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
