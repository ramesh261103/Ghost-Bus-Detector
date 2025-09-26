import React, { useState, useEffect, useCallback } from "react";
import MapComponent from "./MapComponent";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import "./App.css"; // ensure CSS applied

function App() {
  const [counts, setCounts] = useState({ ghost: 0, healthy: 0, total: 0 });
  const [status, setStatus] = useState("Disconnected");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleCountsUpdate = useCallback((newCounts) => {
    setCounts(newCounts);
    setStatus("Connected");
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    // Initial status check
    const checkStatus = () => {
      fetch("http://127.0.0.1:8000/buses")
        .then((res) => {
          if (res.ok) {
            setStatus("Connected");
          } else {
            setStatus("Disconnected");
          }
        })
        .catch(() => setStatus("Disconnected"));
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Update lastUpdated every 1 second to synchronize with map
  useEffect(() => {
    const updateTimer = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(updateTimer);
  }, []);

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <header className="app-header">
        <h1>GHOST BUS DETECTOR</h1>
      </header>
      <div className="main-content">
        <AnalyticsDashboard
          counts={counts}
          status={status}
          lastUpdated={lastUpdated}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <div className="map-container">
          <MapComponent onCountsUpdate={handleCountsUpdate} />
        </div>
      </div>
    </div>
  );
}

export default App;
