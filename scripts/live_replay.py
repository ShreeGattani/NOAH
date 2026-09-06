"""
Live Weather Data Replay
------------------------
Loads the local 2024 INMET weather dataset, cleans it using the existing
cleaning pipeline, and sends one cleaned observation to the NOAH backend
every 30 seconds.

The backend is responsible for everything after receiving the observation:
database storage, ML models, anomaly detection, WebSocket broadcasting, etc.
"""

import argparse
import sys
import time
from pathlib import Path

import requests


# ============================================================
# CONFIGURATION
# ============================================================

# The default location of the dataset
CSV_ARCHIVE_DIR = str(Path(__file__).resolve().parent.parent / "data")

YEAR = 2024

# Send one observation every 30 seconds.
INTERVAL_SECONDS = 30

# Local FastAPI backend.
BACKEND_URL = "http://localhost:8000"

# post_reading endpoint.
INGEST_ENDPOINT = "/readings"

REQUEST_TIMEOUT = 10


# ============================================================
# IMPORT EXISTING CLEANING PIPELINE
# ============================================================

# Add project root to Python path so this works when executed as:
# python ml/live_replay.py

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.preprocessing.clean import get_clean_data


# ============================================================
# BUILD BACKEND PAYLOAD
# ============================================================

def build_payload(record):
    """
    Convert one cleaned record into the exact WeatherReading
    structure expected by the backend.

    Cleaning/ML-only fields are intentionally not sent.
    """

    return {
        "timestamp": record["timestamp"],
        "station_id": record["station_id"],
        "station_name": record.get("station_name"),
        "latitude": record["latitude"],
        "longitude": record["longitude"],
        "altitude": record.get("altitude"),

        "temperature": record.get("temperature"),
        "humidity": record.get("humidity"),
        "pressure": record.get("pressure"),
        "rainfall": record.get("rainfall"),
        "wind_speed": record.get("wind_speed"),
    }


# ============================================================
# DISPLAY
# ============================================================

def print_record(index, total, record):
    """Display the observation being sent."""

    print()
    print("=" * 65)
    print(f"OBSERVATION {index}/{total}")
    print("=" * 65)

    print(f"Station      : {record.get('station_id')}")
    print(f"Station Name : {record.get('station_name')}")
    print(f"Timestamp    : {record.get('timestamp')}")
    print(f"Temperature  : {record.get('temperature')} °C")
    print(f"Humidity     : {record.get('humidity')} %")
    print(f"Pressure     : {record.get('pressure')} hPa")
    print(f"Rainfall     : {record.get('rainfall')} mm")
    print(f"Wind Speed   : {record.get('wind_speed')} m/s")


def print_backend_response(response):
    """Display the backend response without assuming its exact schema."""

    print()
    print(f"Backend HTTP status: {response.status_code}")

    try:
        data = response.json()
        print("Backend response:")
        print(data)
    except ValueError:
        print("Backend response:")
        print(response.text)


# ============================================================
# FAULT INJECTION
# ============================================================

import random
import tempfile
from pathlib import Path
SURGE_FILE = Path(tempfile.gettempdir()) / "noah_surge_faults.flag"
surge_readings_left = 0

def apply_fault_if_needed(record):
    global surge_readings_left
    
    if SURGE_FILE.exists():
        SURGE_FILE.unlink(missing_ok=True)
        # 120 readings = 10 full network cycles. 15% fault prob = ~18 faults total during surge.
        surge_readings_left = 120
        print("⚡ FAULT SURGE DETECTED! Spiking fault probability for next 120 readings.")
        
    fault_prob = 0.15 if surge_readings_left > 0 else 0.005
    
    if surge_readings_left > 0:
        surge_readings_left -= 1
        
    if random.random() < fault_prob:
        # Inject realistic, varying fault
        fault_type = random.choice(["temp_spike", "humidity_drop"])
        if fault_type == "temp_spike" and record.get("temperature") is not None:
            spike = random.uniform(15.0, 35.0)
            record["temperature"] = round(record["temperature"] + spike, 2)
            print(f"⚠ INJECTED FAULT: Temperature Spike (+{spike:.1f}°C)")
        elif fault_type == "humidity_drop" and record.get("humidity") is not None:
            drop = random.uniform(30.0, 60.0)
            record["humidity"] = max(0.0, round(record["humidity"] - drop, 2))
            print(f"⚠ INJECTED FAULT: Humidity Drop (-{drop:.1f}%)")
            
    return record


# ============================================================
# SEND ONE READING
# ============================================================

def send_reading(record):
    """
    Send one cleaned observation to the backend.

    Returns:
        True  -> successfully accepted by backend
        False -> request failed
    """

    record = apply_fault_if_needed(dict(record))
    payload = build_payload(record)

    url = f"{BACKEND_URL.rstrip('/')}/{INGEST_ENDPOINT.lstrip('/')}"

    try:
        response = requests.post(
            url,
            json=payload,
            timeout=REQUEST_TIMEOUT
        )

        print_backend_response(response)

        if response.ok:
            print("✓ Reading successfully sent to backend")
            return True

        print("⚠ Backend rejected the reading")
        return False

    except requests.exceptions.ConnectionError:
        print()
        print("✗ Could not connect to backend.")
        print(f"  Make sure FastAPI is running at: {BACKEND_URL}")
        return False

    except requests.exceptions.Timeout:
        print()
        print("✗ Backend request timed out.")
        return False

    except requests.exceptions.RequestException as exc:
        print()
        print(f"✗ Request failed: {exc}")
        return False


# ============================================================
# MAIN REPLAY
# ============================================================

def run_replay(
    archive_dir=CSV_ARCHIVE_DIR,
    interval=INTERVAL_SECONDS,
    station_id=None,
    limit=None
):
    """Load, clean and replay the 2024 dataset."""

    print()
    print("╔" + "═" * 63 + "╗")
    print("║" + " NOAH WEATHER LIVE DATA REPLAY ".center(63) + "║")
    print("╚" + "═" * 63 + "╝")

    print()
    print(f"Dataset       : {archive_dir}/2024.csv")
    print(f"Replay interval: {interval} seconds")
    print(f"Backend       : {BACKEND_URL}")
    print(f"Endpoint      : {INGEST_ENDPOINT}")

    if station_id:
        print(f"Station filter : {station_id}")

    print()
    print("Loading and cleaning 2024 data...")

    try:
        import json
        cache_path = Path(archive_dir) / "cleaned_records.json"
        
        if cache_path.exists() and not station_id:
            print("Loading cleaned dataset from cache...")
            with open(cache_path, "r") as f:
                records = json.load(f)
        else:
            records = get_clean_data(
                year=YEAR,
                max_rows=None,
                station_id=station_id,
                archive_dir=archive_dir,
            )
            if not station_id:
                print("Saving cleaned dataset to cache...")
                with open(cache_path, "w") as f:
                    json.dump(records, f)

    except FileNotFoundError as exc:
        print()
        print("✗ Dataset not found.")
        print(exc)
        return

    except Exception as exc:
        print()
        print("✗ Failed while loading/cleaning dataset.")
        print(f"Error: {exc}")
        return

    if not records:
        print()
        print("✗ No records available after cleaning.")
        return

    # --------------------------------------------------------
    # Sort chronologically and group by timestamp
    # --------------------------------------------------------

    from itertools import groupby

    records.sort(key=lambda x: x.get("timestamp", ""))
    grouped = [(ts, list(group)) for ts, group in groupby(records, key=lambda x: x.get("timestamp", ""))]

    if limit is not None:
        grouped = grouped[:limit]

    total_groups = len(grouped)

    print(f"✓ Cleaned timestamp intervals available: {total_groups}")

    print()
    print("Starting live replay...")
    print("Press Ctrl+C to stop.")
    print()

    # --------------------------------------------------------
    # Replay loop
    # --------------------------------------------------------

    try:
        for index, (ts, group_records) in enumerate(grouped, start=1):

            print()
            print("=" * 65)
            print(f"TIMESTAMP {index}/{total_groups} | {ts}")
            print(f"Sending {len(group_records)} station observations...")
            print("=" * 65)

            for record in group_records:
                success = send_reading(record)
                if not success:
                    print(f"⚠ Observation for {record.get('station_id')} was not accepted.")

            # Don't wait after the final group.
            if index < total_groups:

                print()
                print(
                    f"Next timestamp in {interval} seconds..."
                )

                time.sleep(interval)

    except KeyboardInterrupt:
        print()
        print()
        print("Replay stopped by user.")
        print("✓ Shutdown complete.")


# ============================================================
# COMMAND LINE INTERFACE
# ============================================================

def main():

    parser = argparse.ArgumentParser(
        description="Replay cleaned 2024 weather data as live telemetry."
    )

    parser.add_argument(
        "--interval",
        type=int,
        default=INTERVAL_SECONDS,
        help="Seconds between observations (default: 30)"
    )

    parser.add_argument(
        "--station",
        type=str,
        default=None,
        help="Optional station ID to replay only one station"
    )

    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Optional maximum number of observations to replay"
    )

    parser.add_argument(
        "--archive",
        type=str,
        default=CSV_ARCHIVE_DIR,
        help="Directory containing 2024.csv"
    )

    args = parser.parse_args()

    if args.interval < 0:
        parser.error("--interval cannot be negative")

    if args.limit is not None and args.limit <= 0:
        parser.error("--limit must be greater than 0")

    run_replay(
        archive_dir=args.archive,
        interval=args.interval,
        station_id=args.station,
        limit=args.limit,
    )


if __name__ == "__main__":
    main()
