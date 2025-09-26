import React, { useState, useEffect } from "react";

const StatusHeader = () => {
  const [status, setStatus] = useState("Disconnected");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [busCount, setBusCount] = useState(0);
  const [ghostCount, setGhostCount] = useState(0);

  const fetchBuses = () => {
    fetch("http://127.0.0.1:8000/buses")
      .then((res) => res.json())
      .then((data) => {
        setStatus("Connected");
        setLastUpdated(new Date().toLocaleTimeString());
        if (data.buses) {
          setBusCount(data.buses.length);
          setGhostCount(data.buses.filter((b) => b.status === "Ghost").length);
        }
      })
      .catch(() => setStatus("Disconnected"));
  };

  useEffect(() => {
    fetchBuses();
    const interval = setInterval(fetchBuses, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "15px",
      background: "#f5f5f5",
      padding: "10px 20px",
      borderBottom: "2px solid #ddd",
      fontFamily: "Arial, sans-serif"
    }}>
      <h2 style={{ margin: 0 }}>🚌 GhostWatch</h2>
      <span>Status: <b style={{ color: status === "Connected" ? "green" : "red" }}>{status}</b></span>
      <span>Last updated: {lastUpdated || "..."}</span>
      <span>Buses: {busCount}</span>
      <span>Ghosts: {ghostCount}</span>
    </div>
  );
};

export default StatusHeader;
