import time
import requests
import random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google.transit import gtfs_realtime_pb2

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# GTFS-RT feeds for different cities
cities = {
    "Boston": "https://cdn.mbta.com/realtime/VehiclePositions.pb",
    "New York": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace",
    "Chicago": "https://gtfsrt.prod.obanyc.com/vehiclePositions"
}

vehicles = {}
last_update = 0
current_city = "Boston"

@app.get("/cities")
def get_cities():
    return {"cities": list(cities.keys())}

def fetch_bus_data(city="Boston"):
    global vehicles, last_update, current_city
    now = time.time()

    # Refresh every 10 seconds
    if now - last_update > 10:
        try:
            feed_url = cities.get(city, cities["Boston"])
            response = requests.get(feed_url, timeout=10)
            response.raise_for_status()

            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(response.content)

            vehicles.clear()
            for entity in feed.entity:
                if entity.HasField('vehicle'):
                    vehicle = entity.vehicle
                    vid = vehicle.vehicle.id
                    ts = vehicle.timestamp
                    lat = vehicle.position.latitude
                    lon = vehicle.position.longitude

                    # Determine status based on timestamp freshness
                    status = "Healthy" if now - ts <= 300 else "Ghost"

                    # Mock crowding estimation
                    crowding = random.choice(["Low", "Medium", "High"])

                    # Mock predictive arrival time
                    prediction = random.randint(1, 15)

                    # Mock alerts
                    alerts = []
                    if status == "Ghost":
                        alerts.append("Ghost bus detected")
                    if crowding == "High":
                        alerts.append("High crowding")

                    vehicles[vid] = {
                        "latitude": lat,
                        "longitude": lon,
                        "timestamp": ts,
                        "status": status,
                        "current_status": getattr(vehicle, 'current_status', 'N/A'),
                        "updated_at": ts,
                        "connected": True,
                        "crowding": crowding,
                        "prediction": prediction,
                        "alerts": alerts
                    }

            last_update = now
            current_city = city
            print(f"Fetched {len(vehicles)} buses for {city} at {time.strftime('%H:%M:%S')}")

        except Exception as e:
            print(f"Error fetching bus data: {e}")

@app.get("/buses")
def get_buses(city: str = "Boston"):
    fetch_bus_data(city)

    output = []
    ghost_count = 0
    healthy_count = 0
    crowding_levels = {"Low": 0, "Medium": 0, "High": 0}

    for vid, bus in vehicles.items():
        status = bus.get("status", "Healthy")
        if status == "Ghost":
            ghost_count += 1
        elif status == "Healthy":
            healthy_count += 1

        crowding = bus.get("crowding", "Low")
        crowding_levels[crowding] += 1

        output.append({
            "id": vid,
            "lat": bus.get("latitude"),
            "lon": bus.get("longitude"),
            "status": status,
            "current_status": bus.get("current_status", "N/A"),
            "updated_at": bus.get("timestamp"),
            "connected": bus.get("connected", True),
            "crowding": crowding,
            "prediction": bus.get("prediction", 0),
            "alerts": bus.get("alerts", [])
        })

    avg_crowding = "Low"
    if crowding_levels["High"] > crowding_levels["Medium"] and crowding_levels["High"] > crowding_levels["Low"]:
        avg_crowding = "High"
    elif crowding_levels["Medium"] > crowding_levels["Low"]:
        avg_crowding = "Medium"

    return {
        "buses": output,
        "counts": {
            "ghost": ghost_count,
            "healthy": healthy_count,
            "total": len(output)
        },
        "crowding": crowding_levels,
        "avg_crowding": avg_crowding
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
