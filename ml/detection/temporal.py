
import numpy as np
import pandas as pd
import json




# ============================================================
# CONFIGURATION
# ============================================================


# Number of previous readings used by rule-based detectors
ROLLING_WINDOW = 5

# Spike threshold
SPIKE_THRESHOLD = 3.0

# Frozen sensor tolerance
FROZEN_TOLERANCE = 0.01

# Drift parameters
DRIFT_CHANGE_THRESHOLD = 0.2
DRIFT_REQUIRED_CHANGES = 4

# Missing-data parameters
MISSING_WINDOW = 3
MISSING_REQUIRED = 3


# ============================================================
# 1. VALIDATE INPUT
# ============================================================

def validate_dataframe(df: pd.DataFrame) -> None:
    """
    Check that the DataFrame contains the columns required
    by the temporal detector.
    """

    required_columns = [
        "station_id",
        "timestamp",
        "temperature",
        "humidity",
        "pressure",
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )


# ============================================================
# 2. PREPARE DATA
# ============================================================

def prepare_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare the cleaned DataFrame for temporal analysis.
    - Converts timestamps.
    - Sorts each station chronologically.
    """

    validate_dataframe(df)

    data = df.copy()

    data["timestamp"] = pd.to_datetime(
        data["timestamp"],
        errors="coerce"
    )

    data = data.dropna(
        subset=["station_id", "timestamp"]
    )

    data = data.sort_values(
        ["station_id", "timestamp"]
    ).reset_index(drop=True)

    return data


# ============================================================
# 3. CALCULATE TEMPORAL DELTAS
# ============================================================

def calculate_deltas(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate changes between consecutive observations.

    Calculated separately for each station.
    """

    data = df.copy()

    data["temp_delta_1h"] = (
        data.groupby("station_id")["temperature"]
        .diff()
    )

    data["humidity_delta_1h"] = (
        data.groupby("station_id")["humidity"]
        .diff()
    )

    data["pressure_delta_1h"] = (
        data.groupby("station_id")["pressure"]
        .diff()
    )

    return data


# ============================================================
# 4. SPIKE DETECTION
# ============================================================

def detect_spikes(
    df: pd.DataFrame,
    threshold: float = SPIKE_THRESHOLD
) -> pd.DataFrame:
    """
    Detect sudden measurement spikes across temperature, humidity, and pressure.

    Uses the previous five readings to calculate:
        rolling mean
        rolling standard deviation
        z-score
    """

    data = df.copy()
    spike_flags = pd.Series(False, index=data.index)

    for var in ["temperature", "humidity", "pressure", "wind_speed", "rainfall"]:
        if var not in data.columns:
            continue

        rolling_mean = (
            data.groupby("station_id")[var]
            .transform(
                lambda x:
                x.shift(1)
                .rolling(ROLLING_WINDOW)
                .mean()
            )
        )

        rolling_std = (
            data.groupby("station_id")[var]
            .transform(
                lambda x:
                x.shift(1)
                .rolling(ROLLING_WINDOW)
                .std()
            )
            .replace(0, np.nan)
        )

        z_score = (data[var] - rolling_mean) / rolling_std
        var_spike = (z_score.abs() > threshold).fillna(False)
        spike_flags = spike_flags | var_spike

    data["spike"] = spike_flags

    return data


# ============================================================
# 5. FROZEN SENSOR DETECTION
# ============================================================

def detect_frozen_sensor(
    df: pd.DataFrame,
    tolerance: float = FROZEN_TOLERANCE
) -> pd.DataFrame:
    """
    Detect a sensor that stops changing.

    If temperature, humidity, pressure, or wind speed remain almost unchanged for several
    consecutive readings, the sensor may be frozen.
    """

    data = df.copy()
    frozen_flags = pd.Series(False, index=data.index)

    for var in ["temperature", "humidity", "pressure", "wind_speed"]:
        if var not in data.columns:
            continue

        var_change = (
            data.groupby("station_id")[var]
            .diff()
        )

        data["_unchanged"] = (
            var_change.abs() < tolerance
        )

        var_frozen = (
            data.groupby("station_id")["_unchanged"]
            .transform(
                lambda x:
                x.rolling(ROLLING_WINDOW)
                .sum()
                == ROLLING_WINDOW
            )
        )

        frozen_flags = frozen_flags | var_frozen.fillna(False)

    if "_unchanged" in data.columns:
        data.drop(columns=["_unchanged"], inplace=True)

    data["frozen"] = frozen_flags

    return data


# ============================================================
# 6. DRIFT DETECTION
# ============================================================

def detect_drift(
    df: pd.DataFrame,
    change_threshold: float = DRIFT_CHANGE_THRESHOLD,
    required_changes: int = DRIFT_REQUIRED_CHANGES
) -> pd.DataFrame:
    """
    Detect persistent movement in one direction across weather parameters.
    """

    data = df.copy()
    drift_flags = pd.Series(False, index=data.index)

    for var in ["temperature", "humidity", "pressure"]:
        if var not in data.columns:
            continue

        var_change = (
            data.groupby("station_id")[var]
            .diff()
        )

        data["_pos_change"] = (var_change > change_threshold)
        data["_neg_change"] = (var_change < -change_threshold)

        pos_count = (
            data.groupby("station_id")["_pos_change"]
            .transform(
                lambda x:
                x.rolling(ROLLING_WINDOW)
                .sum()
            )
        )

        neg_count = (
            data.groupby("station_id")["_neg_change"]
            .transform(
                lambda x:
                x.rolling(ROLLING_WINDOW)
                .sum()
            )
        )

        var_drift = (
            (pos_count >= required_changes)
            |
            (neg_count >= required_changes)
        )

        drift_flags = drift_flags | var_drift.fillna(False)

    data.drop(
        columns=[c for c in ["_pos_change", "_neg_change"] if c in data.columns],
        inplace=True,
    )

    data["drift"] = drift_flags

    return data


# ============================================================
# 7. COMMUNICATION / MISSING-DATA DETECTION
# ============================================================

def detect_communication_failure(
    df: pd.DataFrame
) -> pd.DataFrame:
    """
    Detect consecutive missing sensor readings.

    Three consecutive missing observations indicate
    a possible communication failure.
    """

    data = df.copy()

    primary_vars = [
        v for v in ["temperature", "humidity", "pressure"]
        if v in data.columns
    ]

    if primary_vars:
        data["missing_observation"] = (
            data[primary_vars].isna().all(axis=1)
        )
    else:
        data["missing_observation"] = False

    data["missing_count"] = (
        data.groupby("station_id")["missing_observation"]
        .transform(
            lambda x:
            x.rolling(MISSING_WINDOW)
            .sum()
        )
    )

    data["communication_failure"] = (
        data["missing_count"]
        >= MISSING_REQUIRED
    )

    data["communication_failure"] = (
        data["communication_failure"]
        .fillna(False)
    )

    return data


# ============================================================
# 12. MAIN TEMPORAL DETECTION PIPELINE
# ============================================================

def detect_temporal_anomalies(
    df: pd.DataFrame
):
    """
    Run temporal anomaly detection.

    The detector uses four rule-based temporal checks:

        1. Spike detection
        2. Frozen sensor detection
        3. Drift detection
        4. Communication/missing-data detection

    The detector is dataset-agnostic and works on any cleaned
    sensor DataFrame containing the required columns.
    """

    # --------------------------------------------------------
    # PREPARE
    # --------------------------------------------------------

    data = prepare_data(df)

    # --------------------------------------------------------
    # RULE-BASED DETECTION
    # --------------------------------------------------------

    data = calculate_deltas(data)

    data = detect_spikes(data)

    data = detect_frozen_sensor(data)

    data = detect_drift(data)

    data = detect_communication_failure(data)

    # --------------------------------------------------------
    # BASE OUTPUT
    # --------------------------------------------------------

    output = data[
        [
            "station_id",
            "timestamp",
            "spike",
            "drift",
            "frozen",
            "communication_failure",
        ]
    ].copy()

    # --------------------------------------------------------
    # TEMPORAL ANOMALY SCORE
    # --------------------------------------------------------
    # Scores are weighted to produce one overall temporal
    # anomaly score between 0 and 1.
    #
    # Spike                  = 30%
    # Drift                  = 25%
    # Frozen sensor          = 25%
    # Communication failure = 20%
    #
    # The final score is converted to 0-100 by
    # format_temporal_output().

    output["temporal_anomaly_score"] = (

        output["spike"].astype(float)
        * 0.30

        +

        output["drift"].astype(float)
        * 0.25

        +

        output["frozen"].astype(float)
        * 0.85

        +

        output["communication_failure"].astype(float)
        * 0.85
    )

    output["temporal_anomaly_score"] = (
        output["temporal_anomaly_score"]
        .clip(0.0, 1.0)
    )

    return output


def format_temporal_output(results):
    """
    Convert temporal anomaly results into the JSON format
    required by the fusion module (Person 4).
    """

    output = []

    for _, row in results.iterrows():

        flags = []

        if row["spike"]:
            flags.append("spike_detection")

        if row["drift"]:
            flags.append("drift_detection")

        if row["frozen"]:
            flags.append("frozen_sensor")

        if row["communication_failure"]:
            flags.append("communication_failure")

        # Internal score is 0–1
        # Person 4 receives score as 0–100
        score = float(row["temporal_anomaly_score"]) * 100

        score = max(0.0, min(100.0, score))

        timestamp = pd.Timestamp(row["timestamp"])

        # Convert UTC timestamp to the requested Z format
        if timestamp.tzinfo is not None:
            timestamp = timestamp.tz_convert("UTC")

        timestamp_string = timestamp.isoformat()

        if timestamp_string.endswith("+00:00"):
            timestamp_string = timestamp_string[:-6] + "Z"

        output.append({
            "timestamp": timestamp_string,
            "station_id": str(row["station_id"]),
            "temporal_anomaly_score": round(score, 2),
            "temporal_flags": flags
        })

    return output


def save_temporal_json(results, output_path="temporal_output.json"):
    """
    Save temporal anomaly results as a JSON file.
    """

    output = format_temporal_output(results)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=4)

    print(f"Temporal anomaly JSON saved to: {output_path}")

    return output