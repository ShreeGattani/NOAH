from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest

from ..preprocessing.features import FeatureScaler


class NoahIsolationForest:
    """
    Isolation Forest model used by Person 4 for ML-based anomaly detection.

    The model expects the final 22-feature matrix produced by features.py.

    Isolation Forest decision_function:
        higher value = more normal
        lower value = more anomalous

    anomaly_score():
        converts the raw decision_function output into a relative
        0-100 anomaly score.

        0   = relatively normal
        100 = extremely anomalous relative to training data
    """

    EXPECTED_FEATURE_COUNT = 22

    def __init__(
        self,
        n_estimators: int = 200,
        contamination: float = 0.01,
        random_state: int = 42,
    ):
        self.model = IsolationForest(
            n_estimators=n_estimators,
            contamination=contamination,
            random_state=random_state,
        )

        # Exact feature order used during training.
        self.feature_columns: list[str] = []

        # Distribution of Isolation Forest scores on training data.
        self.train_decision_scores: np.ndarray | None = None

        # The scaler used by features.py.
        # Stored with the model so inference can reuse the training scaler.
        self.scaler: FeatureScaler | None = None

    def fit(
        self,
        X: np.ndarray,
        feature_columns: list[str],
        scaler: FeatureScaler | None = None,
    ) -> "NoahIsolationForest":
        """
        Train the Isolation Forest.

        Parameters
        ----------
        X:
            Training feature matrix containing exactly 22 ML features.

        feature_columns:
            Names of the features in the same order as X.

        scaler:
            FeatureScaler fitted on the training data.
            Stored with the model for later inference.
        """

        # ---------------------------------------------------------
        # Validate training feature count
        # ---------------------------------------------------------

        if X.ndim != 2:
            raise ValueError(
                f"X must be a 2D feature matrix, got {X.ndim} dimensions."
            )

        if X.shape[1] != self.EXPECTED_FEATURE_COUNT:
            raise ValueError(
                f"SkyGuard expects exactly "
                f"{self.EXPECTED_FEATURE_COUNT} features, "
                f"but X has {X.shape[1]} columns."
            )

        if len(feature_columns) != self.EXPECTED_FEATURE_COUNT:
            raise ValueError(
                f"SkyGuard expects exactly "
                f"{self.EXPECTED_FEATURE_COUNT} feature names, "
                f"but received {len(feature_columns)}."
            )

        if X.shape[1] != len(feature_columns):
            raise ValueError(
                f"X has {X.shape[1]} columns but "
                f"{len(feature_columns)} feature names were provided."
            )

        # Remember the exact feature order used during training.
        self.feature_columns = list(feature_columns)

        # Store the fitted scaler for later inference.
        self.scaler = scaler

        # Train Isolation Forest.
        self.model.fit(X)

        # Save training score distribution for relative anomaly scoring.
        self.train_decision_scores = self.model.decision_function(X)

        return self

    def validate_features(self, feature_columns: list[str]) -> None:
        """
        Verify that inference features exactly match the features
        and ordering used during training.
        """

        if not self.feature_columns:
            raise RuntimeError(
                "Model has not been fitted with feature columns."
            )

        if feature_columns != self.feature_columns:
            raise ValueError(
                "Feature columns or feature order do not match "
                "the trained model.\n"
                f"Expected: {self.feature_columns}\n"
                f"Received: {feature_columns}"
            )

    def decision_function(self, X: np.ndarray) -> np.ndarray:
        """
        Return the raw Isolation Forest decision function.

        Higher = more normal.
        Lower = more anomalous.
        """

        if X.ndim != 2:
            raise ValueError(
                f"X must be a 2D feature matrix, got {X.ndim} dimensions."
            )

        if X.shape[1] != self.EXPECTED_FEATURE_COUNT:
            raise ValueError(
                f"Expected {self.EXPECTED_FEATURE_COUNT} features, "
                f"got {X.shape[1]}."
            )

        return self.model.decision_function(X)

    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Return Isolation Forest's binary prediction.

        +1 = normal
        -1 = anomaly
        """

        if X.ndim != 2:
            raise ValueError(
                f"X must be a 2D feature matrix, got {X.ndim} dimensions."
            )

        if X.shape[1] != self.EXPECTED_FEATURE_COUNT:
            raise ValueError(
                f"Expected {self.EXPECTED_FEATURE_COUNT} features, "
                f"got {X.shape[1]}."
            )

        return self.model.predict(X)

    def anomaly_score(self, X: np.ndarray) -> np.ndarray:
        """
        Convert Isolation Forest decision_function values into
        relative 0-100 anomaly scores.

        0   = relatively normal
        100 = extremely anomalous relative to training data

        IMPORTANT:
            This is a relative anomaly score, not a probability.
            A score of 90 does NOT mean a 90% probability of anomaly.
        """

        if self.train_decision_scores is None:
            raise RuntimeError("Model must be fitted before scoring.")

        raw_scores = self.decision_function(X)

        sorted_train = np.sort(self.train_decision_scores)

        ranks = np.searchsorted(
            sorted_train,
            raw_scores,
            side="right",
        )

        percentile = ranks / len(sorted_train)

        anomaly_scores = (1.0 - percentile) * 100.0

        return np.clip(anomaly_scores, 0.0, 100.0)

    def save(self, model_path: str | Path) -> None:
        """
        Save the complete trained model.

        The saved object includes:
        - Isolation Forest
        - feature column order
        - training decision-score distribution
        - fitted FeatureScaler
        """

        model_path = Path(model_path)
        model_path.parent.mkdir(parents=True, exist_ok=True)

        joblib.dump(self, model_path)

    @staticmethod
    def load(model_path: str | Path) -> "NoahIsolationForest":
        """
        Load a previously trained model.
        """

        model = joblib.load(model_path)

        if not isinstance(model, NoahIsolationForest):
            raise TypeError(
                "The loaded file does not contain a "
                "SkyGuardIsolationForest model."
            )

        return model