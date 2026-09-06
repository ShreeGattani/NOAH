# Noah's Ark — Real-Time Weather Station Anomaly Intelligence

> **Making Weather Data Trustworthy.**  
> Real-time monitoring and anomaly detection platform for Automatic Weather Stations (AWS).

---

## 🛰️ Overview

**NOAH** is a real-time mission-control platform designed for meteorological networks. It monitors Automatic Weather Stations (AWS) transmitting temperature, atmospheric pressure, and relative humidity telemetry, performing:
- **Spatial / Cross-Sensor Consistency Checks** (distinguishing true regional weather events from isolated sensor hardware faults)
- **Temporal & Physical Gradient Validation** (Clausius-Clapeyron, dT/dt rate thresholds)
- **ML Anomaly Detection** (Spatial-Temporal + Isolation Forest)
- **Sensor Health Scoring (0–100)** & Maintenance Dispatch

This repository contains the full-stack system, including the Next.js frontend, FastAPI backend, and the Machine Learning pipeline.

---

## 🏗️ Architecture & Tech Stack

### 🧠 Machine Learning Engine (`/ml`)
- **Models**: Spatial-Temporal Analysis, Isolation Forest for anomaly detection.
- **Frameworks**: `scikit-learn`, `pandas`, `numpy`, `joblib`.
- **Pipeline**: Automated training (`train.py`), anomaly fusion (`anomaly_fusion.py`), and model serving.

### 🔌 Backend (`/backend`)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python >= 3.11).
- **Real-Time Data**: WebSocket streaming for live telemetry.
- **Database**: PostgreSQL (via SQLAlchemy).

### 🖥️ Frontend Mission Control (`/frontend`)
- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript).
- **Styling**: Tailwind CSS v4 + Custom Navy Cyber Matrix tokens.
- **Visualizations**: Recharts, Framer Motion, React-Leaflet with CartoDB Dark Matter tiles.

---

## 📁 Repository Structure

```text
NOAH/
├── backend/       # FastAPI application, API routes, and WebSocket endpoints
├── data/          # Raw and processed datasets (e.g., 2024.csv, cleaned_records.json)
├── frontend/      # Next.js interactive dashboard and UI components
├── ml/            # Anomaly detection logic, model definitions, and fusion engine
│   └── models/    # Serialized ML models (e.g., joblib/pickle)
├── pyproject.toml # Python dependencies and project metadata
└── scripts/       # Training, testing, and live replay scripts
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (>= 3.11)
- **[uv](https://docs.astral.sh/uv/)** (Fast Python package installer)

### 2. Setup the ML & Backend
Clone the repository and install the Python dependencies:
```bash
# Install dependencies using uv
uv sync

# (Optional) Train the models if needed
uv run scripts/train.py

# Start the FastAPI server
cd backend
uv run uvicorn app.main:app --reload --port 8000
```
The backend will be available at `http://localhost:8000`.

### 3. Setup the Frontend
Open a new terminal window:
```bash
cd frontend
npm install

# Setup environment variables
cp .env.example .env.local # Update to point NEXT_PUBLIC_API_URL to the backend

# Run the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to access the Mission Control dashboard.

---

## 📡 Live Data Replay

To simulate a live stream of telemetry for the dashboard to consume, you can run the live replay script. This script loads historical dataset observations, processes them, and POSTs them to the backend exactly as a physical weather station would.

```bash
uv run scripts/live_replay.py --interval 3
```

- `--interval`: Seconds to wait between transmitting observations.
- `--station`: Optional station ID filter to only replay a specific location.
- `--limit`: Stop replaying after a specified number of events.

---
