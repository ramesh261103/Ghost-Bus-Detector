from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import requests, time, math, asyncio, json, random
from google.transit import gtfs_realtime_pb2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

bus_data = {}
last_update = 0
last_seen = {}  # Store last timestamp & position

# GTFS-RT feeds for different cities
cities = {
    "boston": "https://cdn.mbta.com/realtime/VehiclePositions.pb",
    "newyork": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs",  # Example, may not be real
    "chicago": "https://gtfsrt.api.transit.chicago/api/gtfsrt"  # Example
}

current_city = "boston"
feed_url = cities[current_city]

def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two lat/lon points."""
    R = 6371  # Earth radius (km)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) *
         math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return 2 * R * math.asin(math.sqrt(a))

def fetch_bus_data():
    global bus_data, last_update, last_seen
    now = time.time()

    # Refresh every 5 seconds
    if now - last_update > 5:
        try:
            response = requests.get(feed_url, timeout=10)
            response.raise_for_status()

            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(response.content)

            buses = {}
            for entity in feed.entity:
                if entity.HasField('vehicle'):
                    vehicle = entity.vehicle
                    bus_id = vehicle.vehicle.id
                    lat = vehicle.position.latitude
                    lon = vehicle.position.longitude
                    ts = vehicle.timestamp

                    status = "Healthy"
                    # Check previous data
                    if bus_id in last_seen:
                        prev = last_seen[bus_id]
                        prev_time = prev["time"]
                        prev_lat, prev_lon = prev["lat"], prev["lon"]

                        # Rule 1: Stale GPS (> 1 min 30 sec no update) - Ghost
                        if now - prev_time > 90:
                            status = "Ghost"

                        # Rule 2: Impossible jump (> 20 km in < 30 sec) - Ghost
                        distance = haversine(prev_lat, prev_lon, lat, lon)
                        if distance > 20 and (now - prev_time) < 30:
                            status = "Ghost"

                        # Rule 3: Stationary for too long (> 10 min no movement)
                        if distance < 0.1 and (now - prev_time) > 600:
                            status = "Ghost"

                        # Rule 4: Healthy if updated within 5 seconds
                        if now - prev_time <= 5:
                            status = "Healthy"

                    last_seen[bus_id] = {"time": now, "lat": lat, "lon": lon}

                    crowding = random.choice(['Low', 'Medium', 'High'])
                    prediction = random.randint(5, 15)  # minutes to next stop
                    alerts = []
                    if status == "Ghost":
                        alerts.append(f"Bus {bus_id} is a ghost bus")

                    buses[bus_id] = {
                        "latitude": lat,
                        "longitude": lon,
                        "status": status,
                        "updated_at": ts,
                        "current_status": getattr(vehicle, 'current_status', 'N/A'),
                        "connected": True,
                        "crowding": crowding,
                        "prediction": prediction,
                        "alerts": alerts
                    }

            bus_data = buses
            last_update = now
            print(f"Fetched {len(buses)} buses at {time.strftime('%H:%M:%S')}")

        except Exception as e:
            print(f"Error fetching bus data: {e}")

@app.get("/cities")
def get_cities():
    return {"cities": list(cities.keys())}

@app.get("/buses")
def get_buses(city: str = "boston"):
    global current_city, feed_url
    if city != current_city and city in cities:
        current_city = city
        feed_url = cities[current_city]
        # Reset data for new city
        global bus_data, last_seen
        bus_data = {}
        last_seen = {}
    fetch_bus_data()
    return {
        "buses": [
            {
                "id": k,
                "lat": v["latitude"],
                "lon": v["longitude"],
                "status": v["status"],
                "updated_at": v.get("updated_at"),
                "current_status": v.get("current_status"),
                "connected": v.get("connected", True),
                "crowding": v.get("crowding"),
                "prediction": v.get("prediction"),
                "alerts": v.get("alerts", [])
            } for k, v in bus_data.items()
        ],
        "counts": {
            "ghost": sum(1 for v in bus_data.values() if v["status"] == "Ghost"),
            "healthy": sum(1 for v in bus_data.values() if v["status"] == "Healthy"),
            "total": len(bus_data)
        }
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            fetch_bus_data()
            await websocket.send_text(json.dumps(bus_data))
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        print("WebSocket disconnected")
