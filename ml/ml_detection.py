from __future__ import annotations

import numpy as np

from .models.isolation_forest import NoahIsolationForest


class MLDetector:
    """
    Interface between the rest of the Noah system and
    the trained Isolation Forest model.

    Input:
        22-feature NumPy matrix

    Output:
        ML anomaly score (0-100)
        ML binary prediction (+1 normal, -1 anomaly)
    """

    def __init__(self, model: NoahIsolationForest):
        self.model = model

    def detect(self, X: np.ndarray) -> dict:
        """
        Run ML anomaly detection on the provided feature matrix.

        Parameters
        ----------
        X:
            2D NumPy array containing the 22 ML features.

        Returns
        -------
        dict
            Contains anomaly scores and binary predictions.
        """

        if X.ndim != 2:
            raise ValueError(
                f"X must be a 2D feature matrix, got {X.ndim} dimensions."
            )

        if X.shape[1] != self.model.EXPECTED_FEATURE_COUNT:
            raise ValueError(
                f"Expected {self.model.EXPECTED_FEATURE_COUNT} features, "
                f"got {X.shape[1]}."
            )

        anomaly_scores = self.model.anomaly_score(X)
        predictions = self.model.predict(X)

        return {
            "ml_anomaly_scores": anomaly_scores,
            "ml_predictions": predictions,
        }