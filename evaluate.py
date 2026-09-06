from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np

from ml.preprocessing.clean import load_year_range, clean_and_flag_records
from ml.preprocessing.features import extract_ml_features, ML_FEATURE_FIELDS
from ml.models.isolation_forest import NoahIsolationForest


MODEL_PATH = Path("models/isolation_forest.joblib")
SCALER_PATH = Path("models/feature_scaler.pkl")

TEST_YEAR = 2023
TEST_SAMPLE_SIZE = 10_000

ANOMALY_THRESHOLD = 50.0


def evaluate():
    print("=" * 60)
    print("NOAH AI - SYNTHETIC ANOMALY EVALUATION")
    print("=" * 60)

    # ---------------------------------------------------------
    # 1. Load trained model and scaler
    # ---------------------------------------------------------
    print("\n[1/5] Loading trained model...")

    model = NoahIsolationForest.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    print("✓ Model loaded")
    print("✓ Scaler loaded")

    # ---------------------------------------------------------
    # 2. Load 2023 test data
    # ---------------------------------------------------------
    print("\n[2/5] Loading 2023 test sample...")

    raw_records = load_year_range(
        "archive",
        TEST_YEAR,
        TEST_YEAR,
        max_rows=TEST_SAMPLE_SIZE,
    )

    cleaned_records = clean_and_flag_records(raw_records)

    valid_records = [
        record
        for record in cleaned_records
        if (
            record.get("temperature") is not None
            and record.get("humidity") is not None
            and record.get("pressure") is not None
        )
    ]

    print(f"✓ Using {len(valid_records):,} valid observations")

    # ---------------------------------------------------------
    # 3. Inject synthetic anomalies
    # ---------------------------------------------------------
    print("\n[3/5] Injecting synthetic anomalies...")

    anomaly_indices = [1000, 2000, 3000, 4000]

    # Temperature anomaly
    valid_records[1000]["temperature"] = 60.0

    # Humidity anomaly
    valid_records[2000]["humidity"] = 5.0

    # Pressure anomaly
    valid_records[3000]["pressure"] = 900.0

    # Combined temperature + humidity anomaly
    valid_records[4000]["temperature"] = 60.0
    valid_records[4000]["humidity"] = 5.0

    print("✓ Injected 4 known anomalies")

    # ---------------------------------------------------------
    # 4. Extract ML features
    # ---------------------------------------------------------
    print("\n[4/5] Extracting features...")

    feature_records = extract_ml_features(
        valid_records,
        include_metadata=True,
        scaler=scaler,
    )

    X_test = np.asarray(
        [
            [record[field] for field in ML_FEATURE_FIELDS]
            for record in feature_records
        ],
        dtype=np.float32,
    )

    # ---------------------------------------------------------
    # DEBUG: inspect pressure anomaly features
    # ---------------------------------------------------------
    print("\nDEBUG pressure anomaly:")
    print("Feature values at index 3000:")

    pressure_features = [
        "scaled_pressure",
        "scaled_pressure_delta_1h",
        "scaled_pressure_rolling_mean_3h",
        "scaled_pressure_rolling_std_3h",
    ]

    for feature in pressure_features:
        if feature in ML_FEATURE_FIELDS:
            feature_index = ML_FEATURE_FIELDS.index(feature)
            print(
                f"  {feature}: "
                f"{X_test[3000][feature_index]:.4f}"
            )

    # ---------------------------------------------------------
    # 5. Run Isolation Forest
    # ---------------------------------------------------------
    print("\n[5/5] Running trained Isolation Forest...")

    scores = model.anomaly_score(X_test)

    print("\n" + "=" * 60)
    print("SYNTHETIC ANOMALY RESULTS")
    print("=" * 60)

    detected_count = 0

    for index in anomaly_indices:
        score = float(scores[index])

        detected = score >= ANOMALY_THRESHOLD

        if detected:
            detected_count += 1

        result = "DETECTED" if detected else "NOT DETECTED"

        print(f"\nInjected anomaly at index {index}:")
        print(f"  Anomaly score : {score:.2f}")
        print(f"  Threshold     : {ANOMALY_THRESHOLD:.2f}")
        print(f"  Result        : {result}")

    # ---------------------------------------------------------
    # Summary
    # ---------------------------------------------------------
    detection_rate = (
        detected_count / len(anomaly_indices)
    ) * 100

    print("\n" + "=" * 60)
    print("EVALUATION SUMMARY")
    print("=" * 60)

    print(f"Injected anomalies : {len(anomaly_indices)}")
    print(f"Detected anomalies : {detected_count}")
    print(f"Detection rate     : {detection_rate:.2f}%")


if __name__ == "__main__":
    evaluate()