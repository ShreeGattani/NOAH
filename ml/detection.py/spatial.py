"""P3 spatial anomaly detection for NOAH.

This module owns both geographic-neighbor generation and spatial weather
comparison.  Neighbor geography is generated from the stations present in the
current dataset; a saved neighbor CSV may be supplied as a cache, but it is
never treated as permanent truth, so new/changed stations are handled safely.

Spatial evidence is kept separate from P2 temporal evidence and from P4's
final diagnosis.
"""
from __future__ import annotations

import math
import json
from pathlib import Path
from typing import Iterable

import numpy as np
import pandas as pd

SENSOR_COLUMNS = ["temperature", "humidity", "pressure", "rainfall", "wind_speed"]

EARTH_RADIUS_KM = 6371.0088
CANDIDATE_K = 12
MAX_CANDIDATE_DISTANCE_KM = 1200.0
MAX_NEIGHBORS = 8
MIN_NEIGHBORS = 2
MIN_QUALITY = 66.7

# These are eligibility limits, not anomaly thresholds.  Altitude is used as a
# soft compatibility factor; pressure is additionally altitude-normalized.
ALTITUDE_LIMITS_M = {
    "temperature": 700.0,
    "humidity": 1000.0,
    "pressure": 1200.0,
    "rainfall": 1200.0,
    "wind_speed": 1000.0,
}

# Weather variables do not behave identically.  These are conservative starting
# tolerances for the real INMET data and should be calibrated on the training set.
TOLERANCE = {
    "temperature": 2.0,
    "humidity": 8.0,
    "pressure": 2.5,
    "rainfall": 3.0,
    "wind_speed": 3.0,
}

# Prevent a tiny neighbor spread from producing an artificially huge score.
MAD_FLOOR = {
    "temperature": 0.50,
    "humidity": 2.0,
    "pressure": 1.0,
    "rainfall": 1.0,
    "wind_speed": 1.0,
}

# Rainfall is spatially patchy, so use a shorter comparison radius.  Pressure
# can be compared over a somewhat wider radius after altitude normalization.
MAX_DISTANCE_BY_VARIABLE_KM = {
    "temperature": 700.0,
    "humidity": 700.0,
    "pressure": 900.0,
    "rainfall": 300.0,
    "wind_speed": 700.0,
}


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two latitude/longitude points."""
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return EARTH_RADIUS_KM * 2.0 * math.asin(math.sqrt(min(1.0, a)))


def _station_metadata(weather: pd.DataFrame) -> pd.DataFrame:
    required = ["station_id", "latitude", "longitude", "altitude"]
    missing = [c for c in required if c not in weather.columns]
    if missing:
        raise ValueError(f"Spatial detector missing station metadata: {missing}")

    cols = required + (["station_name"] if "station_name" in weather.columns else [])
    meta = weather[cols].copy()
    for c in ["latitude", "longitude", "altitude"]:
        meta[c] = pd.to_numeric(meta[c], errors="coerce")
    meta = meta.dropna(subset=["station_id", "latitude", "longitude", "altitude"])
    return meta.drop_duplicates("station_id").reset_index(drop=True)


def build_geographic_neighbors(weather_or_stations: pd.DataFrame) -> pd.DataFrame:
    """Create the small, static candidate-neighbor table from current stations.

    This is geography only.  Weather availability, quality, altitude weighting
    and variable-specific eligibility are evaluated later for each observation.
    """
    meta = _station_metadata(weather_or_stations)
    values = meta[["station_id", "latitude", "longitude", "altitude"]].to_numpy()
    rows: list[dict] = []

    for i, (sid, lat, lon, alt) in enumerate(values):
        candidates = []
        for j, (nid, nlat, nlon, nalt) in enumerate(values):
            if i == j:
                continue
            distance = haversine_km(float(lat), float(lon), float(nlat), float(nlon))
            if distance <= MAX_CANDIDATE_DISTANCE_KM:
                candidates.append((distance, str(nid), float(nalt)))
        candidates.sort(key=lambda x: x[0])
        for distance, nid, nalt in candidates[:CANDIDATE_K]:
            rows.append({
                "station_id": str(sid),
                "neighbor_id": nid,
                "distance_km": round(distance, 3),
                "station_altitude": float(alt),
                "neighbor_altitude": nalt,
                "altitude_difference_m": abs(float(alt) - nalt),
            })

    return pd.DataFrame(rows, columns=[
        "station_id", "neighbor_id", "distance_km",
        "station_altitude", "neighbor_altitude", "altitude_difference_m",
    ])


def save_neighbor_table(neighbor_table: pd.DataFrame, path: str | Path) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    neighbor_table.to_csv(path, index=False)


def _load_or_refresh_neighbors(weather: pd.DataFrame, neighbor_table: pd.DataFrame | None) -> pd.DataFrame:
    current = _station_metadata(weather)
    if neighbor_table is None:
        return build_geographic_neighbors(current)

    required = {"station_id", "neighbor_id", "distance_km", "station_altitude", "neighbor_altitude", "altitude_difference_m"}
    if not required.issubset(neighbor_table.columns):
        return build_geographic_neighbors(current)

    # A cache is valid only if every current station is represented as a target
    # with current coordinates/altitudes.  This naturally handles new or moved
    # stations; dropped stations simply have no observations in the current run.
    cached = neighbor_table.copy()
    cached["station_id"] = cached["station_id"].astype(str)
    current_ids = set(current["station_id"].astype(str))
    cached_ids = set(cached["station_id"])
    if not current_ids.issubset(cached_ids):
        return build_geographic_neighbors(current)

    # Validate the cached geometry against current station coordinates and
    # altitude.  A station can keep the same ID but be relocated; that must
    # invalidate the cache because its neighbors and distances have changed.
    current_meta = current.set_index("station_id")[["latitude", "longitude", "altitude"]]
    cached_target_ids = set(cached["station_id"].astype(str))
    for sid, row in current_meta.iterrows():
        rows = cached[cached["station_id"] == sid]
        if rows.empty:
            return build_geographic_neighbors(current)
        expected_lat = float(row["latitude"])
        expected_lon = float(row["longitude"])
        expected_alt = float(row["altitude"])
        # The cache stores only station/neighbor geometry indirectly, so
        # reconstruct the target coordinates from the current station table
        # and verify every cached neighbor ID still exists.
        if not set(rows["neighbor_id"].astype(str)).issubset(current_ids):
            return build_geographic_neighbors(current)
        if not np.allclose(rows["station_altitude"].to_numpy(dtype=float), expected_alt, atol=1.0):
            return build_geographic_neighbors(current)

        # Distances are recomputed from current coordinates rather than trusting
        # stale cached distances.  This catches moved stations even when their
        # altitude did not change.
        for r in rows.itertuples(index=False):
            neighbor = current_meta.loc[str(r.neighbor_id)]
            actual_distance = haversine_km(
                expected_lat, expected_lon,
                float(neighbor["latitude"]), float(neighbor["longitude"]),
            )
            if not math.isclose(actual_distance, float(r.distance_km), rel_tol=0.0, abs_tol=0.5):
                return build_geographic_neighbors(current)
            if not math.isclose(abs(expected_alt - float(neighbor["altitude"])),
                                float(r.altitude_difference_m), rel_tol=0.0, abs_tol=1.0):
                return build_geographic_neighbors(current)

    return cached


def _distance_weight(distance_km: pd.Series) -> pd.Series:
    return 1.0 / (1.0 + (distance_km / 75.0) ** 2)


def _altitude_weight(variable: str, altitude_difference_m: pd.Series) -> pd.Series:
    limit = ALTITUDE_LIMITS_M[variable]
    return (1.0 - altitude_difference_m / limit).clip(lower=0.15, upper=1.0)


def _pressure_to_target_altitude(
    pressure_hpa: pd.Series,
    neighbor_altitude_m: pd.Series,
    target_altitude_m: pd.Series,
    neighbor_temperature_c: pd.Series,
) -> pd.Series:
    """Approximate pressure at target altitude using the hypsometric equation."""
    rd = 287.05
    g = 9.80665
    temp_k = (pd.to_numeric(neighbor_temperature_c, errors="coerce") + 273.15).clip(lower=180.0)
    exponent = g * (neighbor_altitude_m - target_altitude_m) / (rd * temp_k)
    return pressure_hpa * np.exp(exponent)


def _weighted_median(values: np.ndarray, weights: np.ndarray) -> float:
    order = np.argsort(values)
    values = values[order]
    weights = weights[order]
    total = weights.sum()
    if total <= 0:
        return float(np.median(values))
    return float(values[np.searchsorted(np.cumsum(weights), total / 2.0)])


def _score_group(group: pd.DataFrame, variable: str, spatial_bias: float = 0.0) -> tuple[float, float, int]:
    values = group["comparison_value"].to_numpy(dtype=float)
    weights = group["weight"].to_numpy(dtype=float)
    reference = _weighted_median(values, weights)
    deviations = np.abs(values - reference)
    mad = _weighted_median(deviations, weights)
    target = float(group["target_value"].iloc[0])
    residual = abs((target - reference) - spatial_bias)
    scale = max(1.4826 * mad, MAD_FLOOR[variable])
    adjusted = max(0.0, residual - TOLERANCE[variable])
    score = float(np.clip(1.0 - math.exp(-0.75 * adjusted / scale), 0.0, 1.0))
    return score, reference, len(group)


def _score_variable(df: pd.DataFrame, neighbors: pd.DataFrame, variable: str, baseline: pd.DataFrame | None = None) -> pd.DataFrame:
    base = df[["timestamp", "station_id", "altitude", variable]].copy()
    base["station_id"] = base["station_id"].astype(str)
    base["month"] = base["timestamp"].dt.month
    base[variable] = pd.to_numeric(base[variable], errors="coerce")
    base = base.rename(columns={"altitude": "target_altitude", variable: "target_value"})

    right_cols = ["timestamp", "station_id", variable, "data_quality_score"]
    if variable == "pressure":
        right_cols.append("temperature")
    right = df[right_cols].copy()
    right["station_id"] = right["station_id"].astype(str)
    rename = {
        "station_id": "neighbor_id",
        variable: "neighbor_value",
        "data_quality_score": "neighbor_quality",
    }
    if variable == "pressure":
        rename["temperature"] = "neighbor_temperature"
    right = right.rename(columns=rename)

    n = neighbors.copy()
    n["station_id"] = n["station_id"].astype(str)
    n["neighbor_id"] = n["neighbor_id"].astype(str)
    n = n[n["distance_km"] <= MAX_DISTANCE_BY_VARIABLE_KM[variable]].copy()
    n = n[n["altitude_difference_m"] <= ALTITUDE_LIMITS_M[variable]].copy()

    pairs = n.merge(right, on="neighbor_id", how="inner")
    pairs = pairs.merge(
        base[["timestamp", "station_id", "target_altitude", "target_value"]],
        on=["timestamp", "station_id"],
        how="inner",
    )
    pairs = pairs.dropna(subset=["neighbor_value", "target_value"])
    pairs["neighbor_quality"] = pd.to_numeric(pairs["neighbor_quality"], errors="coerce").fillna(0.0)
    pairs = pairs[pairs["neighbor_quality"] >= MIN_QUALITY]

    if pairs.empty:
        return pd.DataFrame({
            "timestamp": df["timestamp"],
            "station_id": df["station_id"].astype(str),
            f"{variable}_spatial_score": np.nan,
            f"{variable}_neighbor_count": 0,
            f"{variable}_spatial_evidence_strength": 0.0,
            f"{variable}_neighbor_reference": np.nan,
        })

    pairs["distance_weight"] = _distance_weight(pairs["distance_km"])
    pairs["altitude_weight"] = _altitude_weight(variable, pairs["altitude_difference_m"])
    pairs["quality_weight"] = (pairs["neighbor_quality"] / 100.0).clip(0.0, 1.0)
    pairs["weight"] = pairs["distance_weight"] * pairs["altitude_weight"] * pairs["quality_weight"]

    if variable == "pressure":
        pairs["comparison_value"] = _pressure_to_target_altitude(
            pd.to_numeric(pairs["neighbor_value"], errors="coerce"),
            pd.to_numeric(pairs["neighbor_altitude"], errors="coerce"),
            pd.to_numeric(pairs["target_altitude"], errors="coerce"),
            pd.to_numeric(pairs["neighbor_temperature"], errors="coerce"),
        )
    else:
        pairs["comparison_value"] = pd.to_numeric(pairs["neighbor_value"], errors="coerce")

    pairs = pairs.dropna(subset=["comparison_value", "weight"])
    pairs = pairs.sort_values(["station_id", "timestamp", "weight"], ascending=[True, True, False])
    pairs = pairs.groupby(["station_id", "timestamp"], sort=False).head(MAX_NEIGHBORS)

    bias_lookup = {}
    if baseline is not None and not baseline.empty:
        b = baseline[(baseline["variable"] == variable)].copy()
        bias_lookup = {(str(r.station_id), int(r.month)): float(r.spatial_bias) for r in b.itertuples(index=False)}

    scored = []
    for (sid, ts), group in pairs.groupby(["station_id", "timestamp"], sort=False):
        month = int(ts.month)
        bias = bias_lookup.get((str(sid), month), 0.0)
        score, reference, count = _score_group(group, variable, bias)
        scored.append((sid, ts, score, reference, count))

    stats = pd.DataFrame(scored, columns=[
        "station_id", "timestamp", "score", "neighbor_reference", "neighbor_count"
    ])
    stats["station_id"] = stats["station_id"].astype(str)
    out = base[["timestamp", "station_id"]].merge(stats, on=["station_id", "timestamp"], how="left")
    out["neighbor_count"] = out["neighbor_count"].fillna(0).astype(int)
    out[f"{variable}_neighbor_count"] = out["neighbor_count"]
    out[f"{variable}_spatial_score"] = out["score"]
    out.loc[out[f"{variable}_neighbor_count"] < MIN_NEIGHBORS, f"{variable}_spatial_score"] = np.nan
    out[f"{variable}_spatial_evidence_strength"] = (out[f"{variable}_neighbor_count"].clip(upper=4) / 4.0).fillna(0.0)
    out[f"{variable}_neighbor_reference"] = out["neighbor_reference"]
    return out[[
        "timestamp", "station_id", f"{variable}_spatial_score",
        f"{variable}_neighbor_count", f"{variable}_spatial_evidence_strength",
        f"{variable}_neighbor_reference"
    ]]


def fit_spatial_baseline(weather: pd.DataFrame, neighbor_table: pd.DataFrame | None = None) -> pd.DataFrame:
    """Fit normal station-vs-neighbor spatial bias on training observations.

    The baseline is station- and month-specific, reducing false positives from
    persistent geographic/climatological differences. Fit this on training data
    only and pass it to ``run_spatial_detection`` for later periods.
    """
    required = ["timestamp", "station_id", "latitude", "longitude", "altitude", "data_quality_score", *SENSOR_COLUMNS]
    missing = [c for c in required if c not in weather.columns]
    if missing:
        raise ValueError(f"Spatial baseline missing columns: {missing}")
    df = weather.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True, errors="coerce")
    df["station_id"] = df["station_id"].astype(str)
    df = df.dropna(subset=["timestamp", "station_id"]).drop_duplicates(["station_id", "timestamp"], keep="last")
    neighbors = _load_or_refresh_neighbors(df, neighbor_table)
    rows = []
    # Baseline uses the same comparable-neighbor logic as detection, so the
    # training and inference definitions remain consistent.
    for variable in SENSOR_COLUMNS:
        base = df[["timestamp", "station_id", "altitude", variable]].copy()
        base["station_id"] = base["station_id"].astype(str)
        base["month"] = base["timestamp"].dt.month
        base = base.rename(columns={"altitude": "target_altitude", variable: "target_value"})
        right_cols = ["timestamp", "station_id", variable, "data_quality_score"]
        if variable == "pressure":
            right_cols.append("temperature")
        right = df[right_cols].copy(); right["station_id"] = right["station_id"].astype(str)
        rename = {"station_id":"neighbor_id", variable:"neighbor_value", "data_quality_score":"neighbor_quality"}
        if variable == "pressure": rename["temperature"] = "neighbor_temperature"
        right = right.rename(columns=rename)
        n = neighbors[(neighbors["distance_km"] <= MAX_DISTANCE_BY_VARIABLE_KM[variable]) & (neighbors["altitude_difference_m"] <= ALTITUDE_LIMITS_M[variable])].copy()
        pairs = n.merge(right, on="neighbor_id", how="inner").merge(base, on=["timestamp","station_id"], how="inner")
        pairs = pairs.dropna(subset=["neighbor_value","target_value"])
        pairs["neighbor_quality"] = pd.to_numeric(pairs["neighbor_quality"], errors="coerce").fillna(0.0)
        pairs = pairs[pairs["neighbor_quality"] >= MIN_QUALITY]
        if pairs.empty: continue
        pairs["weight"] = _distance_weight(pairs["distance_km"]) * _altitude_weight(variable, pairs["altitude_difference_m"]) * (pairs["neighbor_quality"]/100.0).clip(0,1)
        if variable == "pressure":
            pairs["comparison_value"] = _pressure_to_target_altitude(pd.to_numeric(pairs["neighbor_value"], errors="coerce"), pd.to_numeric(pairs["neighbor_altitude"], errors="coerce"), pd.to_numeric(pairs["target_altitude"], errors="coerce"), pd.to_numeric(pairs["neighbor_temperature"], errors="coerce"))
        else: pairs["comparison_value"] = pd.to_numeric(pairs["neighbor_value"], errors="coerce")
        pairs = pairs.dropna(subset=["comparison_value","weight"]).sort_values(["station_id","timestamp","weight"], ascending=[True,True,False]).groupby(["station_id","timestamp"], sort=False).head(MAX_NEIGHBORS)
        refs=[]
        for (sid,ts), g in pairs.groupby(["station_id","timestamp"], sort=False):
            ref=_weighted_median(g["comparison_value"].to_numpy(float), g["weight"].to_numpy(float))
            target=float(g["target_value"].iloc[0])
            refs.append((str(sid), int(pd.Timestamp(ts).month), target-ref))
        if refs:
            tmp=pd.DataFrame(refs, columns=["station_id","month","signed_residual"])
            med=tmp.groupby(["station_id","month"], as_index=False)["signed_residual"].median().rename(columns={"signed_residual":"spatial_bias"})
            med["variable"]=variable; rows.append(med)
    if not rows:
        return pd.DataFrame(columns=["station_id","month","variable","spatial_bias"])
    return pd.concat(rows, ignore_index=True)[["station_id","month","variable","spatial_bias"]]


def run_spatial_detection(
    weather: pd.DataFrame,
    neighbor_table: pd.DataFrame | None = None,
    save_neighbors_to: str | Path | None = None,
    baseline: pd.DataFrame | None = None,
) -> pd.DataFrame:
    """Calculate spatial evidence for all supported sensors.

    ``weather`` is the cleaned/enriched P1 data, not the 22-feature ML-only
    dataframe.  The function can save the small geographic neighbor table as a
    reusable cache.  If current station metadata changes, the cache is rebuilt.
    """
    required = [
        "timestamp", "station_id", "latitude", "longitude", "altitude",
        "data_quality_score", *SENSOR_COLUMNS,
    ]
    missing = [c for c in required if c not in weather.columns]
    if missing:
        raise ValueError(f"Spatial detector missing columns: {missing}")

    df = weather.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True, errors="coerce")
    df["station_id"] = df["station_id"].astype(str)
    df = df.dropna(subset=["timestamp", "station_id"])
    df = df.drop_duplicates(["station_id", "timestamp"], keep="last")

    neighbors = _load_or_refresh_neighbors(df, neighbor_table)
    if save_neighbors_to is not None:
        save_neighbor_table(neighbors, save_neighbors_to)

    result = df[["timestamp", "station_id"]].copy()
    for variable in SENSOR_COLUMNS:
        part = _score_variable(df, neighbors, variable, baseline=baseline)
        result = result.merge(part, on=["timestamp", "station_id"], how="left")
    return result


def _json_safe(value):
    """Convert pandas/numpy values to JSON-safe Python values."""
    if pd.isna(value):
        return None
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return float(value)
    if isinstance(value, pd.Timestamp):
        return value.isoformat().replace("+00:00", "Z")
    return value


def _build_p3_json_records(
    spatial: pd.DataFrame,
    cross_sensor: pd.DataFrame,
    weather: pd.DataFrame,
) -> list[dict]:
    """Build the documented one-record-per-station-timestamp P3 contract."""
    base = weather[[
        "timestamp", "station_id",
        "temperature", "humidity", "pressure", "rainfall", "wind_speed",
    ]].copy()
    base["timestamp"] = pd.to_datetime(base["timestamp"], utc=True, errors="coerce")
    base["station_id"] = base["station_id"].astype(str)
    base = base.dropna(subset=["timestamp", "station_id"])
    base = base.drop_duplicates(["station_id", "timestamp"], keep="last")

    merged = base.merge(
        spatial, on=["timestamp", "station_id"], how="left"
    ).merge(
        cross_sensor, on=["timestamp", "station_id"], how="left"
    )

    records = []
    for row in merged.itertuples(index=False):
        r = row._asdict()

        def sensor_block(variable: str) -> dict:
            return {
                "score": _json_safe(r.get(f"{variable}_spatial_score")),
                "neighbor_count": _json_safe(r.get(f"{variable}_neighbor_count")),
                "evidence_strength": _json_safe(
                    r.get(f"{variable}_spatial_evidence_strength")
                ),
                "station_value": _json_safe(r.get(variable)),
                "neighbor_reference": _json_safe(
                    r.get(f"{variable}_neighbor_reference")
                ),
            }

        def cross_block(variable: str) -> dict:
            return {
                "score": _json_safe(r.get(f"{variable}_cross_sensor_score")),
                "dew_point_expected": _json_safe(r.get("dew_point_expected")),
                "dew_point_observed": _json_safe(r.get("dew_point_observed")),
                "dew_point_residual": _json_safe(r.get("dew_point_residual")),
                "independent_observation_available": _json_safe(
                    r.get("dew_point_independent_observation_available")
                ),
            }

        record = {
            "station_id": _json_safe(r["station_id"]),
            "timestamp": _json_safe(r["timestamp"]),
            "spatial": {
                "temperature": sensor_block("temperature"),
                "humidity": sensor_block("humidity"),
                "pressure": sensor_block("pressure"),
                "rainfall": sensor_block("rainfall"),
                "wind_speed": sensor_block("wind_speed"),
            },
            "cross_sensor": {
                "temperature": cross_block("temperature"),
                "humidity": cross_block("humidity"),
            },
        }
        records.append(record)

    return records


def run_p3_detection(
    weather: pd.DataFrame,
    output_json_path: str | Path = "p3_output.json",
    neighbor_table: pd.DataFrame | None = None,
    save_neighbors_to: str | Path | None = None,
    baseline: pd.DataFrame | None = None,
) -> pd.DataFrame:
    """Run all P3 checks and write the single JSON file consumed by P4.

    The JSON contains one record per station/timestamp, with independent
    spatial and cross-sensor evidence. It is an evidence contract, not a
    final fault probability or diagnosis.
    """
    spatial = run_spatial_detection(
        weather,
        neighbor_table=neighbor_table,
        save_neighbors_to=save_neighbors_to,
        baseline=baseline,
    )

    from .cross_sensor import run_cross_sensor_checks
    cross_sensor = run_cross_sensor_checks(weather)

    records = _build_p3_json_records(spatial, cross_sensor, weather)

    output_path = Path(output_json_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False, allow_nan=False)

    return spatial.merge(
        cross_sensor, on=["timestamp", "station_id"], how="left"
    )
