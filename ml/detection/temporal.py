"""Rule-based temporal anomaly detection for AWS temperature, humidity and pressure."""

import json
import numpy as np
import pandas as pd

ROLLING_WINDOW = 5
SPIKE_THRESHOLD = 3.0
FROZEN_TOLERANCE = {"temperature": 0.01, "humidity": 0.01, "pressure": 0.01}
DRIFT_CHANGE_THRESHOLD = {"temperature": 1.5, "humidity": 7.0, "pressure": 0.8}
DRIFT_REQUIRED_CHANGES = 4
MISSING_WINDOW = 3
MISSING_REQUIRED = 3
SENSOR_COLUMNS = ["temperature", "humidity", "pressure"]


def validate_dataframe(df: pd.DataFrame) -> None:
    required = ["station_id", "timestamp", *SENSOR_COLUMNS]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")


def prepare_data(df: pd.DataFrame) -> pd.DataFrame:
    """Convert timestamps/sensors and sort observations per station.

    Sensor NaNs are retained so missing-data detection can use them.
    """
    validate_dataframe(df)
    data = df.copy()
    data["timestamp"] = pd.to_datetime(data["timestamp"], errors="coerce")
    for sensor in SENSOR_COLUMNS:
        data[sensor] = pd.to_numeric(data[sensor], errors="coerce")
    data = data.dropna(subset=["station_id", "timestamp"])
    return data.sort_values(["station_id", "timestamp"]).reset_index(drop=True)


def calculate_deltas(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate consecutive changes for all three sensor variables."""
    data = df.copy()
    for sensor in SENSOR_COLUMNS:
        data[f"{sensor}_delta_1h"] = data.groupby("station_id")[sensor].diff()
    return data


def detect_spikes(df: pd.DataFrame, threshold: float = SPIKE_THRESHOLD) -> pd.DataFrame:
    """Detect unusual sudden changes independently for temperature, humidity and pressure."""
    data = df.copy()
    spike_cols = []

    for sensor in SENSOR_COLUMNS:
        mean_col = f"{sensor}_rolling_mean"
        std_col = f"{sensor}_rolling_std"
        z_col = f"{sensor}_z_score"
        flag_col = f"{sensor}_spike"

        data[mean_col] = data.groupby("station_id")[sensor].transform(
            lambda x: x.shift(1).rolling(ROLLING_WINDOW, min_periods=ROLLING_WINDOW).mean()
        )
        data[std_col] = data.groupby("station_id")[sensor].transform(
            lambda x: x.shift(1).rolling(ROLLING_WINDOW, min_periods=ROLLING_WINDOW).std()
        ).replace(0, np.nan)
        data[z_col] = (data[sensor] - data[mean_col]) / data[std_col]
        data[flag_col] = (data[z_col].abs() > threshold).fillna(False)
        spike_cols.append(flag_col)

    data["spike"] = data[spike_cols].any(axis=1)
    data["spike_sensor_count"] = data[spike_cols].sum(axis=1).astype(int)
    return data


def detect_frozen_sensor(df: pd.DataFrame, tolerance=None) -> pd.DataFrame:
    """Detect sensors whose value barely changes for ROLLING_WINDOW observations."""
    data = df.copy()
    tolerance = FROZEN_TOLERANCE if tolerance is None else tolerance
    frozen_cols = []

    for sensor in SENSOR_COLUMNS:
        change_col = f"{sensor}_change"
        delta_col = f"{sensor}_delta_1h"
        unchanged_col = f"{sensor}_unchanged"
        frozen_col = f"{sensor}_frozen"

        data[change_col] = data[delta_col] if delta_col in data else data.groupby("station_id")[sensor].diff()
        data[unchanged_col] = data[change_col].abs() < tolerance[sensor]
        data[frozen_col] = data.groupby("station_id")[unchanged_col].transform(
            lambda x: x.rolling(ROLLING_WINDOW, min_periods=ROLLING_WINDOW).sum() == ROLLING_WINDOW
        ).fillna(False)
        frozen_cols.append(frozen_col)

    data["frozen"] = data[frozen_cols].any(axis=1)
    data["frozen_sensor_count"] = data[frozen_cols].sum(axis=1).astype(int)
    return data

def detect_drift(data):
    """
    Detect sustained same-direction sensor drift.

    A sensor is considered to be drifting when:
    1. Its hourly change exceeds the sensor-specific threshold.
    2. The changes are consistently in the same direction.
    3. At least DRIFT_REQUIRED_CHANGES such changes occur
       within the rolling window.
    """

    data = data.copy()

    for sensor in SENSOR_COLUMNS:

        delta_col = f"{sensor}_delta_1h"
        drift_col = f"{sensor}_drift"

        positive_change = (
            data[delta_col] > DRIFT_CHANGE_THRESHOLD[sensor]
        )

        negative_change = (
            data[delta_col] < -DRIFT_CHANGE_THRESHOLD[sensor]
        )

        # Count consecutive positive changes
        positive_count = (
            positive_change
            .astype(int)
            .groupby(data["station_id"])
            .transform(
                lambda x: x.rolling(
                    window=DRIFT_REQUIRED_CHANGES,
                    min_periods=DRIFT_REQUIRED_CHANGES,
                ).sum()
            )
        )

        # Count consecutive negative changes
        negative_count = (
            negative_change
            .astype(int)
            .groupby(data["station_id"])
            .transform(
                lambda x: x.rolling(
                    window=DRIFT_REQUIRED_CHANGES,
                    min_periods=DRIFT_REQUIRED_CHANGES,
                ).sum()
            )
        )

        data[drift_col] = (
            (positive_count >= DRIFT_REQUIRED_CHANGES)
            | (negative_count >= DRIFT_REQUIRED_CHANGES)
        )

    # Overall temporal drift:
    # true if ANY sensor shows sustained drift
    data["drift"] = data[
        [f"{sensor}_drift" for sensor in SENSOR_COLUMNS]
    ].any(axis=1)

    data["drift_sensor_count"] = data[
        [f"{sensor}_drift" for sensor in SENSOR_COLUMNS]
    ].sum(axis=1)

    return data


def detect_communication_failure(df: pd.DataFrame) -> pd.DataFrame:
    """Detect sensor-specific missing runs and complete station communication failure.

    A complete communication failure requires temperature, humidity and pressure
    to all be missing for MISSING_REQUIRED consecutive observations.
    """
    data = df.copy()
    missing_cols = []

    for sensor in SENSOR_COLUMNS:
        missing_col = f"missing_{sensor}"
        count_col = f"{sensor}_missing_count"
        failure_col = f"{sensor}_missing_failure"
        data[missing_col] = data[sensor].isna()
        data[count_col] = data.groupby("station_id")[missing_col].transform(
            lambda x: x.rolling(MISSING_WINDOW, min_periods=MISSING_WINDOW).sum()
        )
        data[failure_col] = (data[count_col] >= MISSING_REQUIRED).fillna(False)
        missing_cols.append(missing_col)

    data["all_sensors_missing"] = data[missing_cols].all(axis=1)
    data["all_sensors_missing_count"] = data.groupby("station_id")["all_sensors_missing"].transform(
        lambda x: x.rolling(MISSING_WINDOW, min_periods=MISSING_WINDOW).sum()
    )
    data["communication_failure"] = (data["all_sensors_missing_count"] >= MISSING_REQUIRED).fillna(False)
    data["missing_sensor_count"] = data[missing_cols].sum(axis=1).astype(int)
    return data


def detect_temporal_anomalies(df: pd.DataFrame) -> pd.DataFrame:
    """Run temporal anomaly detection using temperature, humidity and pressure."""
    data = prepare_data(df)
    data = calculate_deltas(data)
    data = detect_spikes(data)
    data = detect_frozen_sensor(data)
    data = detect_drift(data)
    data = detect_communication_failure(data)

    columns = [
        "station_id", "timestamp", "spike", "drift", "frozen", "communication_failure",
        "temperature_spike", "humidity_spike", "pressure_spike",
        "temperature_frozen", "humidity_frozen", "pressure_frozen",
        "temperature_drift", "humidity_drift", "pressure_drift",
        "temperature_missing_failure", "humidity_missing_failure", "pressure_missing_failure",
        "spike_sensor_count", "drift_sensor_count", "frozen_sensor_count", "missing_sensor_count",
    ]
    output = data[columns].copy()

    # Existing system weights are preserved; each combined flag can now be
    # triggered by any of the three sensor variables.
    output["temporal_anomaly_score"] = (
        output["spike"].astype(float) * 0.30
        + output["drift"].astype(float) * 0.25
        + output["frozen"].astype(float) * 0.25
        + output["communication_failure"].astype(float) * 0.20
    ).clip(0.0, 1.0)
    return output


def format_temporal_output(results: pd.DataFrame):
    """Convert temporal results to JSON-ready records for the fusion module."""
    output = []
    for _, row in results.iterrows():
        flags = []
        if row["spike"]: flags.append("spike_detection")
        if row["drift"]: flags.append("drift_detection")
        if row["frozen"]: flags.append("frozen_sensor")
        if row["communication_failure"]: flags.append("communication_failure")

        timestamp = pd.Timestamp(row["timestamp"])
        if timestamp.tzinfo is not None:
            timestamp = timestamp.tz_convert("UTC")
        timestamp_string = timestamp.isoformat()
        if timestamp_string.endswith("+00:00"):
            timestamp_string = timestamp_string[:-6] + "Z"

        output.append({
            "timestamp": timestamp_string,
            "station_id": str(row["station_id"]),
            "temporal_anomaly_score": round(float(row["temporal_anomaly_score"]) * 100, 2),
            "temporal_flags": flags,
            "sensor_evidence": {
                "temperature": {
                    "spike": bool(row["temperature_spike"]),
                    "drift": bool(row["temperature_drift"]),
                    "frozen": bool(row["temperature_frozen"]),
                    "missing_failure": bool(row["temperature_missing_failure"]),
                },
                "humidity": {
                    "spike": bool(row["humidity_spike"]),
                    "drift": bool(row["humidity_drift"]),
                    "frozen": bool(row["humidity_frozen"]),
                    "missing_failure": bool(row["humidity_missing_failure"]),
                },
                "pressure": {
                    "spike": bool(row["pressure_spike"]),
                    "drift": bool(row["pressure_drift"]),
                    "frozen": bool(row["pressure_frozen"]),
                    "missing_failure": bool(row["pressure_missing_failure"]),
                },
            },
            "spike_sensor_count": int(row["spike_sensor_count"]),
            "drift_sensor_count": int(row["drift_sensor_count"]),
            "frozen_sensor_count": int(row["frozen_sensor_count"]),
            "missing_sensor_count": int(row["missing_sensor_count"]),
        })
    return output


def save_temporal_json(results: pd.DataFrame, output_path="temporal_output.json"):
    """Save temporal anomaly results as JSON."""
    output = format_temporal_output(results)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=4)
    print(f"Temporal anomaly JSON saved to: {output_path}")
    return output
