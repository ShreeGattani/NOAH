"""P3 physical/cross-sensor consistency checks for NOAH.

This module supplies evidence to P4; it does not make the final diagnosis.
The implementation supports multiple simultaneous suspicious sensors.
"""
from __future__ import annotations

import math
import numpy as np
import pandas as pd

# INMET observed dew point is an independent reported field.  A 1 C tolerance
# is deliberately conservative for the first implementation; it should be
# calibrated on clean training data before final deployment.
DEW_POINT_TOLERANCE_C = 1.0
DEW_POINT_SCALE_C = 1.0


def magnus_dew_point(temperature: pd.Series, humidity: pd.Series) -> pd.Series:
    """Expected dew point from temperature and RH using the repo's Magnus constants."""
    t = pd.to_numeric(temperature, errors="coerce")
    rh = pd.to_numeric(humidity, errors="coerce")
    valid = t.notna() & rh.notna() & (rh > 0) & (rh <= 100)
    out = pd.Series(np.nan, index=t.index, dtype=float)
    a, b = 17.27, 237.7
    gamma = (a * t[valid] / (b + t[valid])) + np.log(rh[valid] / 100.0)
    out.loc[valid] = (b * gamma) / (a - gamma)
    return out


def score_residual(residual: pd.Series, tolerance: float, scale: float) -> pd.Series:
    adjusted = (pd.to_numeric(residual, errors="coerce") - tolerance).clip(lower=0.0)
    return (1.0 - np.exp(-adjusted / max(scale, 1e-6))).clip(0.0, 1.0)


def _independent_cross_sensor_score(consistency: pd.Series) -> pd.Series:
    """Return cross-sensor evidence without mixing it with spatial evidence."""
    return pd.to_numeric(consistency, errors="coerce").clip(0.0, 1.0)


def run_cross_sensor_checks(weather: pd.DataFrame) -> pd.DataFrame:
    required = ["timestamp", "station_id", "temperature", "humidity", "pressure"]
    missing = [c for c in required if c not in weather.columns]
    if missing:
        raise ValueError(f"Cross-sensor detector missing columns: {missing}")

    df = weather.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True, errors="coerce")
    df["station_id"] = df["station_id"].astype(str)

    df["dew_point_expected"] = magnus_dew_point(df["temperature"], df["humidity"])

    if "observed_dew_point" in df.columns:
        observed = pd.to_numeric(df["observed_dew_point"], errors="coerce")
    else:
        # Never claim an independent check if the independent field is absent.
        observed = pd.Series(np.nan, index=df.index, dtype=float)
    df["dew_point_observed"] = observed
    df["dew_point_residual"] = (observed - df["dew_point_expected"]).abs()
    df["dew_point_consistency_score"] = score_residual(
        df["dew_point_residual"], DEW_POINT_TOLERANCE_C, DEW_POINT_SCALE_C
    ).fillna(0.0)

    # Keep cross-sensor evidence independent from spatial evidence. P4 performs
    # the final fusion and can therefore weight each evidence stream separately.
    df["temperature_cross_sensor_score"] = _independent_cross_sensor_score(
        df["dew_point_consistency_score"]
    )
    df["humidity_cross_sensor_score"] = _independent_cross_sensor_score(
        df["dew_point_consistency_score"]
    )

    # Keep a clear flag that this check used the independent station-reported
    # dew point.  This is useful for P4/UI explanations.
    df["dew_point_independent_observation_available"] = observed.notna()

    return df[[
        "timestamp", "station_id", "dew_point_expected", "dew_point_observed",
        "dew_point_residual", "dew_point_consistency_score",
        "temperature_cross_sensor_score", "humidity_cross_sensor_score",
        "dew_point_independent_observation_available",
    ]]
