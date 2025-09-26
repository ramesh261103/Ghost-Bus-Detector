import React, { useEffect, useRef } from "react";
import L from "leaflet";

const MapComponent = ({ onCountsUpdate }) => {
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const lastUpdateTimesRef = useRef({});
  const lastFetchTimeRef = useRef(Date.now());

  useEffect(() => {
    let counts = { ghost: 0, healthy: 0, total: 0 };

    // Check if map container exists
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    // Clear any existing map instance
    if (mapRef.current) {
      mapRef.current.off();
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Clear container
    
    mapContainer.innerHTML = '';

    const map = L.map("map", {
      center: [42.3601, -71.0589],
      zoom: 12,
      worldCopyJump: true,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Force map to recalculate size after initialization
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);

    const fetchBuses = () => {
      if (!mapRef.current) return;

      lastFetchTimeRef.current = Date.now();

      fetch("http://127.0.0.1:8000/buses")
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (!data.buses) return;

          let renderedCount = 0;

          data.buses.forEach((bus) => {
            if (bus.lat == null || bus.lon == null) {
              // Skip buses with invalid coordinates
              return;
            }

            const color = bus.status === "Ghost" ? "red" : "green";
            const now = Date.now();
            lastUpdateTimesRef.current[bus.id] = bus.updated_at ? bus.updated_at * 1000 : now;

            if (markersRef.current[bus.id]) {
              // Update existing marker position
              markersRef.current[bus.id].setLatLng([bus.lat, bus.lon]);
              // Update icon color if status changed
              const currentIcon = markersRef.current[bus.id].getIcon();
              if (currentIcon && currentIcon.options.html !== `<div style="color:${color}; font-size:20px;">🚌</div>`) {
                markersRef.current[bus.id].setIcon(L.divIcon({
                  className: "custom-marker",
                  html: `<div style="color:${color}; font-size:20px;">🚌</div>`,
                }));
              }
              // Update busStatus
              markersRef.current[bus.id].busStatus = bus.status;

              // Update popup content with new updated_at
              const popupContent = markersRef.current[bus.id].getPopup().getContent();
              let updatedPopup = popupContent;
              if (bus.updated_at) {
                const lastUpdateTime = new Date(bus.updated_at * 1000).toLocaleTimeString();
                const updatedAtTime = new Date(bus.updated_at * 1000).toLocaleString();
                updatedPopup = updatedPopup.replace(/Last Updated:.*?<\/span>/, `Last Updated: <span style="color: #333; font-size: 13px;">${lastUpdateTime}</span>`);
                updatedPopup = updatedPopup.replace(/Updated At:.*?<\/span>/, `Updated At: <span style="color: #333; font-size: 13px;">${updatedAtTime}</span>`);
              }
              markersRef.current[bus.id].setPopupContent(updatedPopup);
            } else {
              // Create new marker
              markersRef.current[bus.id] = L.marker([bus.lat, bus.lon], {
                icon: L.divIcon({
                  className: "custom-marker",
                  html: `<div style="color:${color}; font-size:20px;">🚌</div>`,
                }),
              }).addTo(mapRef.current);
              markersRef.current[bus.id].busStatus = bus.status;

              // Bind popup once with compact and unique design
              const lastUpdate = bus.updated_at ? new Date(bus.updated_at * 1000).toLocaleTimeString() : new Date(now).toLocaleTimeString();
              const popupContent = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 240px; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.2); border: 2px solid ${bus.status === 'Ghost' ? '#ff4757' : '#2ed573'};">
                  <div style="background: linear-gradient(135deg, ${bus.status === 'Ghost' ? '#ff3838' : '#00d2d3'}, ${bus.status === 'Ghost' ? '#ff6b6b' : '#54a0ff'}); color: white; padding: 10px; text-align: center; position: relative;">
                    <div style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.2); border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                      ${bus.status === 'Ghost' ? '👻' : '✅'}
                    </div>
                    <span style="font-size: 24px;">🚌</span>
                    <h4 style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700;">Bus ${bus.id}</h4>
                    <div style="font-size: 12px; opacity: 0.9;">${bus.status.toUpperCase()}</div>
                  </div>

                  <div style="padding: 12px; background: #f8f9fa;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
                      <div><strong style="color: #495057;">⏱ Since Update:</strong></div>
                      <div style="text-align: right; color: #333; font-weight: 600;">0s</div>

                      <div><strong style="color: #495057;">Last Update:</strong></div>
                      <div style="text-align: right; color: #333; font-size: 11px;">${lastUpdate}</div>

                      <div><strong style="color: #495057;">Connected:</strong></div>
                      <div style="text-align: right; color: ${bus.connected ? '#2ed573' : '#ff4757'}; font-weight: 600;">${bus.connected ? 'Yes' : 'No'}</div>

                      <div><strong style="color: #495057;">Coords:</strong></div>
                      <div style="text-align: right; color: #333; font-size: 11px; font-family: monospace;">
                        ${bus.lat ? bus.lat.toFixed(4) : 'N/A'}<br>
                        ${bus.lon ? bus.lon.toFixed(4) : 'N/A'}
                      </div>
                    </div>

                    <div style="text-align: center; margin-top: 10px; padding-top: 8px; border-top: 1px solid #dee2e6;">
                      <small style="color: #6c757d; font-style: italic;">Hover to keep open</small>
                    </div>
                  </div>
                </div>
              `;
              markersRef.current[bus.id].bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup',
                autoPan: false
              });

              // Add hover events once
          markersRef.current[bus.id].on('mouseover', function(e) {
            this.openPopup();
            // Prevent map from moving on hover
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();
          });
          markersRef.current[bus.id].on('mouseout', function() {
            this.closePopup();
          });
            }

            renderedCount++;
          });

          console.log(`Rendered ${renderedCount} markers out of ${data.buses.length} buses`);

          // Update counts for dashboard
          if (data.counts) {
            counts = data.counts;
            onCountsUpdate(counts);
          }
        })
        .catch((err) => {
          console.error("Error fetching buses:", err);
          // Show alert or fallback UI if needed
        });
    };

    // Initial fetch
    fetchBuses();

    // 🔄 Refresh buses every 5 seconds
    const interval = setInterval(fetchBuses, 5000);

    // ⏱ Update tooltips every 1 second
    const tooltipUpdater = setInterval(() => {
      if (!mapRef.current) return;
      Object.keys(markersRef.current).forEach((busId) => {
        const secondsAgo = Math.floor((Date.now() - lastFetchTimeRef.current) / 1000);
        const popupContent = markersRef.current[busId].getPopup().getContent();
        const updatedPopup = popupContent.replace(
          /⏱ Since Update: <span style="color: #333; font-weight: 600;">\d+s<\/span>/,
          `⏱ Since Update: <span style="color: #333; font-weight: 600;">${secondsAgo}s</span>`
        );
        markersRef.current[busId].setPopupContent(updatedPopup);
      });
    }, 1000);

    // ✅ Filtering function
    const showOnly = (status) => {
      if (!mapRef.current) return;
      Object.values(markersRef.current).forEach((marker) => {
        if (status === "all") {
          if (!mapRef.current.hasLayer(marker)) marker.addTo(mapRef.current);
        } else {
          if (marker.busStatus === status) {
            if (!mapRef.current.hasLayer(marker)) marker.addTo(mapRef.current);
          } else {
            if (mapRef.current.hasLayer(marker)) mapRef.current.removeLayer(marker);
          }
        }
      });
    };

      // Fix counts update to correctly pass counts to dashboard
      if (counts) {
        onCountsUpdate(counts);
      }

    // Legend removed - now handled by dashboard

    // ✅ Filter buttons
    const filterControl = L.control({ position: "topleft" });
    filterControl.onAdd = function () {
      const div = L.DomUtil.create("div", "filter-buttons");
      div.style.background = "white";
      div.style.padding = "10px";
      div.style.borderRadius = "8px";

      div.innerHTML = `
        <button id="showAll">All</button>
        <button id="showHealthy">Healthy</button>
        <button id="showGhost">Ghost</button>
      `;

      return div;
    };
    filterControl.addTo(mapRef.current);

    setTimeout(() => {
      document.getElementById("showAll").onclick = () => showOnly("all");
      document.getElementById("showHealthy").onclick = () => showOnly("Healthy");
      document.getElementById("showGhost").onclick = () => showOnly("Ghost");
    }, 500);

    // Cleanup
    return () => {
      clearInterval(interval);
      clearInterval(tooltipUpdater);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onCountsUpdate]);

  return <div id="map"></div>;
};

export default MapComponent;
