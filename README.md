# NOAH — Networked Observation & Anomaly Intelligence

> **Making Weather Data Trustworthy.**  
> Real-time intelligent monitoring & anomaly detection platform for Automatic Weather Stations (AWS).

---

## 🛰️ Overview

**NOAH** is a real-time mission-control platform designed for meteorological networks. It monitors Automatic Weather Stations (AWS) transmitting temperature, atmospheric pressure, and relative humidity telemetry, performing:
- **Spatial / Cross-Sensor Consistency Checks** (distinguishing true regional weather events from isolated sensor hardware faults)
- **Temporal & Physical Gradient Validation** (Clausius-Clapeyron, dT/dt rate thresholds)
- **ML Anomaly Detection** (Spatial-Temporal Autoencoder + Isolation Forest)
- **Sensor Health Scoring (0–100)** & Maintenance Dispatch

---

## ⚡ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Navy Cyber Matrix tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Geospatial Map**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/) with CartoDB Dark Matter tiles
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🕹️ Interactive Hackathon Demo Controller

The frontend includes an interactive **Demo Mode Controller** accessible via the topbar or the dashboard banner. You can switch between 5 scripted scenarios during presentations:

1. **Scenario 1: Nominal Network Operation** — All 12 stations healthy and operating within baseline climatological bounds.
2. **Scenario 2: Regional Weather Front** — Synchronized +3.2°C rise across 4 neighboring stations &rarr; Classified as **🟡 LIKELY WEATHER EVENT**.
3. **Scenario 3: Severe Sudden Spike (Sensor Fault)** — Isolated +31.8°C jump at Delhi Palam (AWS_007) while Safdarjung and Jaipur remain nominal &rarr; Classified as **🔴 LIKELY SENSOR FAULT (96% Confidence)**.
4. **Scenario 4: Frozen Sensor Telemetry** — Guwahati Borjhar (AWS_009) flatlines with 0.000°C variance for 3 hours &rarr; Classified as **FROZEN SENSOR FAULT**.
5. **Scenario 5: Sensor Degradation Pattern** — Progressive health deterioration (95 &rarr; 87 &rarr; 74 &rarr; 61) triggering maintenance recommendation.

---

## 📁 Architecture & Routes

```text
src/
├── app/
│   ├── layout.tsx              # Root layout with dark theme & ClientProviders
│   ├── globals.css             # Navy palette tokens, glow utilities, dark leaflet styling
│   ├── page.tsx                # Landing entry page ("Enter Command Center")
│   ├── dashboard/page.tsx      # Main Mission Control: Metrics, India Map, Active Anomalies, Event Analysis, Live Chart, Health
│   ├── stations/page.tsx       # 12 AWS Station Directory with search, status filters & sorting
│   ├── stations/[id]/page.tsx  # Station Deep-Dive: Sensor metrics, 24h charts with anomaly dots, vertical timeline
│   ├── anomalies/page.tsx      # Anomaly Feed & Archive with severity & type filtering
│   ├── anomalies/[id]/page.tsx # Anomaly Root Cause: Why Flagged checklist, Observed vs Expected, Neighbor comparison table
│   ├── analytics/page.tsx      # ML Model accuracy, false positive rate, anomalies by type, health distribution
│   └── settings/page.tsx       # API/WS configuration & ML threshold sliders
├── components/
│   ├── dashboard/              # IndiaMap, ActiveAnomaliesPanel, EventAnalysisCard, LiveWeatherChart, SensorHealthOverview, DemoScenarioBanner
│   ├── layout/                 # Sidebar, Topbar, AppShell
│   ├── ui/                     # GlassCard, StatusBadge, SeverityBadge, HealthScore, AnimatedNumber, MetricCard, LiveIndicator, PageHeader
│   └── providers/              # ClientProviders
├── context/
│   └── DemoContext.tsx         # Live simulation state & demo scenario switcher
├── data/
│   └── mockData.ts             # 12 realistic Indian AWS stations, 24h time-series generator, rich anomaly events
├── lib/
│   ├── api.ts                  # Data access layer (routes to mock or FastAPI based on env)
│   ├── mockApi.ts              # In-memory mock data operations
│   └── websocket.ts            # WebSocket telemetry client abstraction
└── types/
    └── index.ts                # TypeScript domain models
```

---

## 🔌 Connecting to Backend (FastAPI + WebSocket)

When the backend is ready, simply update `.env.local` or environment variables:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/live
```

The Data Access Layer in `src/lib/api.ts` and `src/lib/websocket.ts` will automatically connect to FastAPI REST and WebSocket endpoints without requiring any changes to UI components.
