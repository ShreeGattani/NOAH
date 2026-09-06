from __future__ import annotations

from typing import Any


def classify_anomaly(
    temporal: dict | None,
    spatial: dict | None,
    cross_sensor: dict | None,
    final_score: float,
) -> str:
    """
    Determine the primary type of anomaly from P2/P3 evidence.
    """

    temporal = temporal or {}
    spatial = spatial or {}
    cross_sensor = cross_sensor or {}

    temporal_flags = temporal.get("temporal_flags", [])

    if "communication_failure" in temporal_flags:
        return "COMMUNICATION_FAILURE"

    if "frozen_sensor" in temporal_flags:
        return "FROZEN_SENSOR"

    if "drift_detection" in temporal_flags:
        return "SENSOR_DRIFT"

    if "spike_detection" in temporal_flags:
        return "SUDDEN_SPIKE"

    # Check spatial evidence for the core variables.
    for variable in ("temperature", "humidity", "pressure"):
        evidence = spatial.get(variable, {})
        if evidence.get("score", 0) > 0.5:
            return "SPATIAL_INCONSISTENCY"

    # Check cross-sensor evidence.
    for variable in ("temperature", "humidity"):
        evidence = cross_sensor.get(variable, {})
        if evidence.get("score", 0) > 0.5:
            return "CROSS_SENSOR_INCONSISTENCY"

    if final_score >= 50:
        return "MULTIVARIATE_ANOMALY"

    return "NORMAL"


def classify_event_type(
    spatial: dict | None,
    final_score: float,
) -> str:
    """
    Determine whether an anomaly is more likely a regional
    weather event or an isolated sensor fault.
    """

    spatial = spatial or {}

    if final_score < 50:
        return "NORMAL"

    regional_evidence = spatial.get("regional_event", False)

    if regional_evidence:
        return "LIKELY_WEATHER_EVENT"

    for variable in ("temperature", "humidity", "pressure"):
        evidence = spatial.get(variable, {})
        if evidence.get("score", 0) > 0.5:
            return "LIKELY_SENSOR_FAULT"

    return "UNDETERMINED"


def calculate_confidence(
    final_score: float,
    anomaly_type: str,
    event_type: str,
) -> float:
    """
    Produce a simple 0–100 confidence score.

    This is confidence in the classification, not a probability.
    """

    if anomaly_type == "NORMAL":
        return round(100.0 - final_score, 2)

    confidence = final_score

    if event_type == "UNDETERMINED":
        confidence *= 0.7

    return round(min(max(confidence, 0.0), 100.0), 2)


def recommendation_for(
    anomaly_type: str,
    event_type: str,
) -> str:
    """
    Generate an actionable recommendation.
    """

    if event_type == "LIKELY_WEATHER_EVENT":
        return (
            "Likely genuine regional atmospheric change; "
            "continue monitoring."
        )

    recommendations = {
        "SUDDEN_SPIKE":
            "Inspect the affected sensor for a transient measurement fault.",

        "FROZEN_SENSOR":
            "Inspect the sensor and communication path for a stuck reading.",

        "SENSOR_DRIFT":
            "Inspect calibration and consider sensor recalibration or replacement.",

        "COMMUNICATION_FAILURE":
            "Check station connectivity, power, and the sensor communication link.",

        "SPATIAL_INCONSISTENCY":
            "Compare with nearby stations and inspect the affected station.",

        "CROSS_SENSOR_INCONSISTENCY":
            "Inspect the temperature and humidity sensors for inconsistent readings.",

        "MULTIVARIATE_ANOMALY":
            "Investigate the observation using temporal, spatial, and cross-sensor evidence.",

        "NORMAL":
            "No action required.",
    }

    return recommendations.get(
        anomaly_type,
        "Investigate the observation and sensor health.",
    )


def classify(
    temporal: dict | None,
    spatial: dict | None,
    cross_sensor: dict | None,
    final_score: float,
) -> dict[str, Any]:
    """
    Complete classification pipeline.
    """

    anomaly_type = classify_anomaly(
        temporal,
        spatial,
        cross_sensor,
        final_score,
    )

    event_type = classify_event_type(
        spatial,
        final_score,
    )

    confidence = calculate_confidence(
        final_score,
        anomaly_type,
        event_type,
    )

    recommendation = recommendation_for(
        anomaly_type,
        event_type,
    )

    return {
        "anomaly_type": anomaly_type,
        "event_type": event_type,
        "confidence": confidence,
        "recommendation": recommendation,
    }