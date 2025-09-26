import React, { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = ({ counts, status, lastUpdated, darkMode, toggleDarkMode }) => {
  const [nextUpdate, setNextUpdate] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setNextUpdate(prev => prev > 0 ? prev - 1 : 5);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="analytics-dashboard">
      <h2 className="dashboard-title">Analytics Dashboard</h2>

      <div className="timings-card">
        <h3>Timings</h3>
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </button>
        <div className="timing-item">
          <span className="timing-label">Last Updated:</span>
          <span className="timing-value">{lastUpdated || 'N/A'}</span>
        </div>
        <div className="timing-item">
          <span className="timing-label">Next Update In:</span>
          <span className="timing-value countdown">{nextUpdate}s</span>
        </div>
        <div className="timing-item">
          <span className="timing-label">Update Interval:</span>
          <span className="timing-value">5 seconds</span>
        </div>
      </div>

      <div className="status-card">
        <h3>System Status</h3>
        <p className={`status-text ${status === 'Connected' ? 'connected' : 'disconnected'}`}>
          {status}
        </p>
      </div>

      <div className="legend-card">
        <h3>Bus Status Legend</h3>
        <div className="legend-item">
          <span className="legend-icon healthy">🟢</span>
          <span>Healthy Buses: <strong>{counts.healthy || 0}</strong></span>
        </div>
        <div className="legend-item">
          <span className="legend-icon ghost">🔴</span>
          <span>Ghost Buses: <strong>{counts.ghost || 0}</strong></span>
        </div>
        <div className="legend-item total">
          <span className="legend-icon total">🚌</span>
          <span>Total Buses: <strong>{counts.total || 0}</strong></span>
        </div>
      </div>

      <div className="analytics-card">
        <h3>Quick Stats</h3>
        <div className="stat">
          <span>Ghost Percentage:</span>
          <span className="stat-value">
            {counts.total > 0 ? ((counts.ghost / counts.total) * 100).toFixed(1) : 0}%
          </span>
        </div>
        <div className="stat">
          <span>Healthy Percentage:</span>
          <span className="stat-value">
            {counts.total > 0 ? ((counts.healthy / counts.total) * 100).toFixed(1) : 0}%
          </span>
        </div>
        <div className="stat">
          <span>Average Crowding:</span>
          <span className="stat-value">
            {counts.total > 0 ? 'Medium' : 'N/A'} {/* Placeholder, can calculate from bus data */}
          </span>
        </div>
      </div>

      <div className="info-card">
        <h3>Instructions</h3>
        <p>Hover over bus markers on the map to view detailed information.</p>
        <p>Healthy buses are shown in green, ghost buses in red.</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
