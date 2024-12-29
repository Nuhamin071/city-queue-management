import React from "react";
import { useLocation } from "react-router-dom";

const ViewDescription = () => {
  const { state } = useLocation();
  const { service } = state || {};

  if (!service) {
    return <p>No service data available.</p>;
  }

  return (
    <div>
      <h1>{service.name}</h1>
      <p>{service.description || "No description available for this service."}</p>
    </div>
  );
};

export default ViewDescription;
