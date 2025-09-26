import time

buses = [
    {"id": "bus1", "lat": 40.7128, "lon": -74.0060, "last_seen": time.time()},
    {"id": "bus2", "lat": 40.7138, "lon": -74.0150, "last_seen": time.time() - 600},  # 10 mins ago
]

now = time.time()
for bus in buses:
    minutes_ago = (now - bus['last_seen']) / 60
    if minutes_ago > 5:  # If more than 5 mins since last update
        print(f"Bus {bus['id']} might be a ghost bus! Last seen {int(minutes_ago)} minutes ago.")
    else:
        print(f"Bus {bus['id']} is healthy.")