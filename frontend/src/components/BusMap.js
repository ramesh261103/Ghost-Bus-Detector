import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons
const activeIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const ghostIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/833/833472.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [1, -30]
});

function BusMap() {
  const [buses, setBuses] = useState({});
  const [city, setCity] = useState("Boston");

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const transformed = {};
      Object.entries(data).forEach(([id, bus]) => {
        transformed[id] = {
          ...bus,
          lat: bus.latitude,
          lon: bus.longitude
        };
      });
      setBuses(transformed);
    };

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setCity(selectedCity);
    fetch(`http://localhost:8000/buses?city=${selectedCity}`)
      .then(res => res.json())
      .then(data => {
        setBuses(data.buses.reduce((acc, bus) => {
          acc[bus.id] = bus;
          return acc;
        }, {}));
      });
  };

  return (
    <>
      <select value={city} onChange={handleCityChange} style={{ marginBottom: '10px' }}>
        <option value="Boston">Boston</option>
        <option value="New York">New York</option>
        <option value="Chicago">Chicago</option>
      </select>
      <MapContainer center={[42.3601, -71.0589]} zoom={13} style={{ height: '600px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Object.entries(buses).map(([vid, bus]) => (
          <Marker
            key={vid}
            position={[bus.lat, bus.lon]}
            icon={bus.status.toLowerCase() === 'ghost' ? ghostIcon : activeIcon}
            opacity={bus.status.toLowerCase() === 'ghost' ? 0.7 : 1}
          >
            <Tooltip>
              {`Bus ${vid} - Status: ${bus.status} - Crowding: ${bus.crowding} - ETA: ${bus.prediction} min`}
              {bus.alerts && bus.alerts.length > 0 && (
                <div>
                  Alerts:
                  <ul>
                    {bus.alerts.map((alert, idx) => <li key={idx}>{alert}</li>)}
                  </ul>
                </div>
              )}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}

export default BusMap;
