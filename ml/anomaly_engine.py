from __future__ import annotations

from typing import Any

from .ml_detection import MLDetector
from .anomaly_fusion import fuse_anomaly_evidence
from .classification.classifier import classify


class AnomalyEngine:
    """
    Main Person-4 anomaly detection engine.

    Combines:
        - Isolation Forest ML detection
        - Temporal evidence
        - Spatial evidence
        - Cross-sensor evidence
        - Final classification
    """

    def __init__(self, ml_detector: MLDetector):
        self.ml_detector = ml_detector

    def process(
        self,
        X,
        temporal: dict | None = None,
        spatial: dict | None = None,
        cross_sensor: dict | None = None,
    ) -> list[dict[str, Any]]:
        """
        Process observations and return final P4 anomaly results.

        X:
            Feature matrix containing the 22 ML features.

        temporal:
            P2 temporal output for the observations.

        spatial:
            P3 spatial output for the observations.

        cross_sensor:
            P3 cross-sensor output for the observations.
        """

        ml_result = self.ml_detector.detect(X)

        ml_scores = ml_result["ml_anomaly_scores"]

        results = []

        for i, ml_score in enumerate(ml_scores):

            temporal_i = self._get_record(temporal, i)
            spatial_i = self._get_record(spatial, i)
            cross_sensor_i = self._get_record(cross_sensor, i)

            fused = fuse_anomaly_evidence(
                ml_score=float(ml_score),
                temporal=temporal_i,
                spatial=spatial_i,
                cross_sensor=cross_sensor_i,
            )

            classification = classify(
                temporal=temporal_i,
                spatial=spatial_i,
                cross_sensor=cross_sensor_i,
                final_score=fused["final_anomaly_score"],
            )

            results.append({
                **fused,
                **classification,
            })

        return results

    @staticmethod
    def _get_record(
        data: dict | list | None,
        index: int,
    ) -> dict:
        """
        Extract the evidence record corresponding to one observation.
        """

        if data is None:
            return {}

        if isinstance(data, list):
            if index < len(data):
                return data[index]
            return {}

        if isinstance(data, dict):
            return data

        return {}