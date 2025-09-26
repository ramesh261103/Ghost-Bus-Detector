import aiohttp
import asyncio
import time
from google.transit import gtfs_realtime_pb2

# MBTA Boston GTFS-RT feed (public access)
feed_url = "https://cdn.mbta.com/realtime/VehiclePositions.pb"

vehicles = {}

async def fetch_feed():
    async with aiohttp.ClientSession() as session:
        while True:
            try:
                async with session.get(feed_url) as response:
                    if response.status == 200:
                        data = await response.read()
                        feed = gtfs_realtime_pb2.FeedMessage()
                        feed.ParseFromString(data)

                        current_time = time.time()
                        vehicles.clear()

                        for entity in feed.entity:
                            if entity.HasField('vehicle'):
                                vehicle = entity.vehicle
                                vid = vehicle.vehicle.id
                                ts = vehicle.timestamp
                                lat = vehicle.position.latitude
                                lon = vehicle.position.longitude

                                status = "Healthy" if current_time - ts <= 300 else "Ghost"

                                vehicles[vid] = {
                                    "latitude": lat,
                                    "longitude": lon,
                                    "timestamp": ts,
                                    "status": status
                                }

                        # Print vehicles with status for debug
                        for vid, info in vehicles.items():
                            print(f"Vehicle {vid}: {info['latitude']}, {info['longitude']} - {info['status']}")
                    else:
                        print(f"Failed to fetch feed, status code: {response.status}")

            except Exception as e:
                print(f"Error fetching feed: {e}")

            await asyncio.sleep(10)  # adjust as needed

if __name__ == "__main__":
    asyncio.run(fetch_feed())
