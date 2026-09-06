from __future__ import annotations

from typing import Any


# ============================================================
# CONFIGURATION
# ============================================================

ML_WEIGHT = 0.40
TEMPORAL_WEIGHT = 0.30
SPATIAL_WEIGHT = 0.20
CROSS_SENSOR_WEIGHT = 0.10

NORMAL_THRESHOLD = 50.0
HIGH_THRESHOLD = 70.0
CRITICAL_THRESHOLD = 85.0


# ============================================================
# SCORE UTILITIES
# ============================================================

def clamp_score(score: float) -> float:
    """Keep an anomaly score inside the 0-100 range."""

    return max(0.0, min(100.0, float(score)))


def spatial_score_to_100(score: float | None) -> float:
    """
    Convert P3 spatial evidence from 0-1 to 0-100.
    """

    if score is None:
        return 0.0

    return clamp_score(float(score) * 100.0)


def cross_sensor_score_to_100(
    score: float | None,
    observation_available: bool,
) -> float:
    """
    Convert P3 cross-sensor evidence from 0-1 to 0-100.

    If the independent observation is unavailable, the
    cross-sensor evidence contributes zero.
    """

    if not observation_available:
        return 0.0

    if score is None:
        return 0.0

    return clamp_score(float(score) * 100.0)


# ============================================================
# P3 AGGREGATION
# ============================================================

def aggregate_spatial_score(
    spatial: dict[str, Any] | None,
) -> float:
    """
    Aggregate P3 variable-level spatial scores.

    Current strategy:
        use the strongest spatial evidence among
        temperature, humidity and pressure.

    P3 scores are originally 0-1.
    Returned score is 0-100.
    """

    if not spatial:
        return 0.0

    scores = []

    for variable in (
        "temperature",
        "humidity",
        "pressure",
    ):

        variable_data = spatial.get(variable, {})

        if not isinstance(variable_data, dict):
            continue

        score = variable_data.get("score")

        if score is not None:
            scores.append(
                float(score)
            )

    if not scores:
        return 0.0

    return spatial_score_to_100(
        max(scores)
    )


def aggregate_cross_sensor_score(
    cross_sensor: dict[str, Any] | None,
) -> tuple[float, bool]:
    """
    Aggregate P3 cross-sensor evidence.

    Current strategy:
        use the strongest available evidence from
        temperature and humidity.

    Returns:
        (score_0_to_100, observation_available)
    """

    if not cross_sensor:
        return 0.0, False

    scores = []
    observation_available = False

    for variable in (
        "temperature",
        "humidity",
    ):

        variable_data = cross_sensor.get(
            variable,
            {},
        )

        if not isinstance(variable_data, dict):
            continue

        score = variable_data.get("score")

        if score is not None:
            scores.append(
                float(score)
            )

        if variable_data.get(
            "independent_observation_available"
        ):
            observation_available = True

    if not scores:
        return 0.0, observation_available

    return (
        cross_sensor_score_to_100(
            max(scores),
            observation_available,
        ),
        observation_available,
    )


# ============================================================
# SEVERITY
# ============================================================

def determine_severity(
    final_score: float,
) -> str:
    """
    Convert final anomaly score into severity.
    """

    score = clamp_score(
        final_score
    )

    if score >= CRITICAL_THRESHOLD:
        return "CRITICAL"

    if score >= HIGH_THRESHOLD:
        return "HIGH"

    if score >= NORMAL_THRESHOLD:
        return "ANOMALY"

    return "NORMAL"


# ============================================================
# FINAL SCORE
# ============================================================

def calculate_final_score(
    ml_score: float,
    temporal_score: float,
    spatial_score: float,
    cross_sensor_score: float,
) -> float:
    """
    Calculate the weighted final anomaly score.

    All input scores must be 0-100.
    """

    final_score = (
        clamp_score(ml_score)
        * ML_WEIGHT

        +

        clamp_score(temporal_score)
        * TEMPORAL_WEIGHT

        +

        clamp_score(spatial_score)
        * SPATIAL_WEIGHT

        +

        clamp_score(cross_sensor_score)
        * CROSS_SENSOR_WEIGHT
    )

    return round(
        clamp_score(final_score),
        2,
    )


# ============================================================
# MAIN FUSION FUNCTION
# ============================================================

def fuse_anomaly_evidence(
    ml_score: float,
    temporal: dict[str, Any] | None = None,
    spatial: dict[str, Any] | None = None,
    cross_sensor: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Combine ML, temporal, spatial and cross-sensor evidence.

    This function does NOT perform final diagnosis.
    Classification is handled separately by classifier.py.
    """

    temporal = temporal or {}
    spatial = spatial or {}
    cross_sensor = cross_sensor or {}

    # --------------------------------------------------------
    # ML
    # --------------------------------------------------------

    ml_score = clamp_score(
        ml_score
    )

    # --------------------------------------------------------
    # Temporal
    # --------------------------------------------------------

    temporal_score = clamp_score(
        temporal.get(
            "temporal_anomaly_score",
            0.0,
        )
    )

    temporal_flags = temporal.get(
        "temporal_flags",
        [],
    )

    # --------------------------------------------------------
    # Spatial
    # --------------------------------------------------------

    spatial_score = aggregate_spatial_score(
        spatial
    )

    # --------------------------------------------------------
    # Cross-sensor
    # --------------------------------------------------------

    (
        cross_sensor_score,
        cross_sensor_available,
    ) = aggregate_cross_sensor_score(
        cross_sensor
    )

    # --------------------------------------------------------
    # Final score
    # --------------------------------------------------------

    final_score = calculate_final_score(
        ml_score=ml_score,
        temporal_score=temporal_score,
        spatial_score=spatial_score,
        cross_sensor_score=cross_sensor_score,
    )

    # --------------------------------------------------------
    # Severity
    # --------------------------------------------------------

    severity = determine_severity(
        final_score
    )

    # --------------------------------------------------------
    # Return fusion result
    # --------------------------------------------------------

    return {
        "ml_anomaly_score": round(
            ml_score,
            2,
        ),

        "temporal_anomaly_score": round(
            temporal_score,
            2,
        ),

        "spatial_anomaly_score": round(
            spatial_score,
            2,
        ),

        "cross_sensor_anomaly_score": round(
            cross_sensor_score,
            2,
        ),

        "final_anomaly_score": final_score,

        "severity": severity,

        "temporal_flags": temporal_flags,

        "cross_sensor_available": (
            cross_sensor_available
        ),
    }