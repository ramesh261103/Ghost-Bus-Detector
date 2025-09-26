# Ghost Bus Detector

A real-time bus tracking system that detects and alerts on "ghost buses" – anomalies in public transit data such as stale GPS signals, impossible location jumps, or buses stationary for too long. The system fetches live GTFS-RT (General Transit Feed Specification - Real-Time) data from transit authorities, processes it to identify issues, and provides a web interface for visualization and analytics.

## Features

- **Real-Time Bus Tracking**: Fetches and displays live bus positions from GTFS-RT feeds.
- **Ghost Bus Detection**: Identifies buses with anomalies based on:
  - Stale GPS data (>1.5 minutes no update).
  - Impossible jumps (>20 km in <30 seconds).
  - Stationary buses (>10 minutes no movement).
- **Multi-City Support**: Switch between cities like Boston, New York, and Chicago.
- **Crowding Estimation**: Mock data for bus crowding levels (Low, Medium, High).
- **Predictive Arrival Times**: Estimated minutes to next stop.
- **WebSocket Updates**: Real-time data streaming to the frontend.
- **Interactive Map**: Visualize buses on a map with status indicators.
- **Analytics Dashboard**: View counts of healthy vs. ghost buses, alerts, and metrics.
- **Notifications**: Alerts for ghost buses and delays.

## Tech Stack

- **Backend**: Python with FastAPI, WebSocket support, GTFS-RT protobuf parsing, CORS middleware.
- **Frontend**: React.js with components for map (using Leaflet or similar), analytics, and status.
- **Data Sources**: GTFS-RT feeds from transit authorities (e.g., MBTA for Boston).
- **Deployment**: Can be run locally or deployed to cloud (e.g., Heroku, AWS).

## Project Structure

```
gosht-bus-detector/
├── backend/                 # FastAPI backend
│   ├── server.py           # Main FastAPI app with endpoints and WebSocket
│   ├── fetch_buses.py      # (If separate fetching logic)
│   ├── feed_ingest.py      # (If separate ingestion)
│   ├── main.py             # (Entry point if needed)
│   └── requirements.txt    # Python dependencies
├── frontend/                # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components (BusMap, AnalyticsDashboard, etc.)
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── package.json        # Node dependencies
│   └── .gitignore          # Frontend-specific ignores
├── docs/                   # Documentation
│   └── FEATURES_PLAN.md    # Implementation plan
├── buses_output.json       # Sample or cached bus data
├── TODO.md                 # Task list
├── README.md               # This file
└── .gitignore              # Root ignores
```

## Installation and Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- Git

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the server:
   ```
   python server.py
   ```
   The backend will run on `http://localhost:8000`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
   The frontend will run on `http://localhost:3000`.

### Running the Full App
- Start the backend first.
- Then start the frontend.
- Open `http://localhost:3000` in your browser to view the app.

## Usage

- Select a city from the dropdown to switch GTFS-RT feeds.
- View buses on the map: Green for healthy, red for ghost.
- Check the analytics dashboard for counts and alerts.
- Real-time updates via WebSocket every 3 seconds.

## API Endpoints

- `GET /cities`: List available cities.
- `GET /buses?city=<city>`: Get bus data for a city.
- `WebSocket /ws`: Real-time bus updates.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m 'Add your feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- Add more cities and GTFS-RT feeds.
- Integrate real crowding data from sensors.
- Improve prediction algorithms with machine learning.
- Add user authentication and personalized alerts.
- Deploy to production with Docker/Kubernetes.
