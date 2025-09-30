# 🚍 Ghost Bus Detector  

A real-time bus tracking system that detects and alerts on **"ghost buses"** – anomalies in public transit data such as stale GPS signals, impossible location jumps, or buses stationary for too long.  

The system fetches live **GTFS-RT (General Transit Feed Specification - Real-Time)** data from transit authorities, processes it to identify issues, and provides a web interface for visualization and analytics.  

---

## ✨ Features  
- **Real-Time Bus Tracking**: Fetches and displays live bus positions from GTFS-RT feeds.  
- **Ghost Bus Detection**: Flags buses with anomalies based on:  
  - ⏱ Stale GPS data (> 1.5 minutes no update).  
  - 🚀 Impossible jumps (> 20 km in < 30 seconds).  
  - 🛑 Stationary buses (> 10 minutes no movement).  
- **Multi-City Support**: Switch between Boston, New York, Chicago, etc.  
- **Crowding Estimation**: Mock data for bus crowding levels (Low, Medium, High).  
- **Predictive Arrival Times**: Estimated minutes to next stop.  
- **WebSocket Updates**: Real-time data streaming to frontend.  
- **Interactive Map**: Buses shown with status indicators.  
- **Analytics Dashboard**: Counts of healthy vs. ghost buses, alerts, and metrics.  
- **Notifications**: Alerts for ghost buses and delays.  

---

## 🛠 Tech Stack  
- **Backend**: Python (FastAPI, WebSockets, GTFS-RT protobuf parsing, CORS).  
- **Frontend**: React.js with Leaflet for map visualization.  
- **Data Sources**: GTFS-RT feeds (e.g., MBTA for Boston).  
- **Deployment**: Local setup or cloud (Heroku, AWS, etc.).  

---

## 📂 Project Structure  
```bash
ghost-bus-detector/
├── backend/                 # FastAPI backend
│   ├── server.py            # Main FastAPI app with endpoints & WebSocket
│   ├── fetch_buses.py       # Fetching logic (if separate)
│   ├── feed_ingest.py       # Ingestion logic (if separate)
│   ├── main.py              # Entry point (if needed)
│   └── requirements.txt     # Python dependencies
│
├── frontend/                # React frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components (BusMap, AnalyticsDashboard, etc.)
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   ├── package.json         # Node dependencies
│   └── .gitignore           # Frontend ignores
│
├── docs/                    # Documentation
│   └── FEATURES_PLAN.md     # Implementation plan
│
├── buses_output.json        # Sample/cached bus data
├── TODO.md                  # Task list
├── README.md                # This file
└── .gitignore               # Root ignores

1️⃣ Clone the Repository
git clone https://github.com/your-username/Ghost-Bus-Detector.git
cd Ghost-Bus-Detector

2️⃣ Start the Backend
cd backend
pip install -r requirements.txt
python server.py


👉 Runs at http://localhost:8000

3️⃣ Start the Frontend
cd frontend
npm install
npm start


👉 Runs at http://localhost:3000

4️⃣ Open the App

Go to http://localhost:3000
 in your browser.

🎯 Usage

Select a city from the dropdown to switch GTFS-RT feeds.

🟢 Green buses → Healthy

🔴 Red buses → Ghost

📊 Analytics dashboard → Counts & alerts

🔔 Notifications for delays and anomalies

Data refreshes every 3 seconds via WebSocket.

📡 API Endpoints

GET /cities → List available cities.

GET /buses?city= → Get bus data for a city.

WebSocket /ws → Real-time bus updates.

🤝 Contributing

Fork this repo.

Create a feature branch:

git checkout -b feature/your-feature


Commit your changes:

git commit -m "Add your feature"


Push branch:

git push origin feature/your-feature


Open a Pull Request.

📜 License

This project is licensed under the MIT License – see the LICENSE
 file.

🔮 Future Enhancements

Add more GTFS-RT city feeds.

Integrate real crowding data from sensors.

Improve prediction with machine learning.

Add user authentication & personalized alerts.

Docker/Kubernetes deployment for production.

