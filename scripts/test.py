from __future__ import annotations

from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import joblib
import numpy as np

from ml.preprocessing.clean import (
    load_year_range,
    clean_and_flag_records,
)

from ml.preprocessing.features import (
    extract_ml_features,
    ML_FEATURE_FIELDS,
)

from ml.models.isolation_forest import NoahIsolationForest


ARCHIVE_DIR = PROJECT_ROOT / "data"
MODEL_DIR = PROJECT_ROOT / "ml" / "models"

MODEL_PATH = MODEL_DIR / "isolation_forest.joblib"
SCALER_PATH = MODEL_DIR / "feature_scaler.pkl"

TEST_YEAR = 2023


def test_model() -> None:

    print("=" * 60)
    print("NOAH AI - 2023 MODEL TEST")
    print("=" * 60)

    # -----------------------------------------------------
    # 1. Load trained artifacts
    # -----------------------------------------------------

    print("\n[1/5] Loading trained model and scaler...")

    model = NoahIsolationForest.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    print("✓ Model loaded.")
    print("✓ Scaler loaded.")

    # -----------------------------------------------------
    # 2. Load 2023 data
    # -----------------------------------------------------

    print("\n[2/5] Loading 2023 data...")

    raw_records = load_year_range(
        str(ARCHIVE_DIR),
        TEST_YEAR,
        TEST_YEAR,
        max_rows=None,
    )

    if not raw_records:
        raise RuntimeError("No 2023 records found.")

    print(f"✓ Loaded {len(raw_records):,} records.")

    # -----------------------------------------------------
    # 3. Clean and select complete observations
    # -----------------------------------------------------

    print("\n[3/5] Cleaning 2023 data...")

    cleaned_records = clean_and_flag_records(raw_records)

    valid_records = [
        record
        for record in cleaned_records
        if record.get("data_quality_score") == 100.0
    ]

    print(f"✓ Cleaned: {len(cleaned_records):,}")
    print(f"✓ Complete: {len(valid_records):,}")

    if not valid_records:
        raise RuntimeError(
            "No complete 2023 observations found."
        )

    # -----------------------------------------------------
    # 4. Extract features using SAVED scaler
    # -----------------------------------------------------

    print("\n[4/5] Extracting 22 ML features...")

    feature_records = extract_ml_features(
        valid_records,
        include_metadata=True,
        scaler=scaler,
    )

    if not feature_records:
        raise RuntimeError(
            "Feature extraction failed."
        )

    X_test = np.asarray(
        [
            [
                record[field]
                for field in ML_FEATURE_FIELDS
            ]
            for record in feature_records
        ],
        dtype=np.float32,
    )

    if X_test.ndim != 2 or X_test.shape[1] != 22:
        raise ValueError(
            f"Invalid test matrix shape: {X_test.shape}"
        )

    print(
        f"✓ Test matrix: {X_test.shape}"
    )

    # -----------------------------------------------------
    # 5. Run trained model
    # -----------------------------------------------------

    print("\n[5/5] Running Isolation Forest...")

    predictions = model.predict(X_test)
    scores = model.anomaly_score(X_test)

    anomaly_count = int(
        np.sum(predictions == -1)
    )

    normal_count = int(
        np.sum(predictions == 1)
    )

    print("\n" + "=" * 60)
    print("2023 TEST COMPLETE")
    print("=" * 60)

    print(f"Total observations : {len(X_test):,}")
    print(f"Normal             : {normal_count:,}")
    print(f"Anomalies          : {anomaly_count:,}")
    print(
        f"Anomaly rate       : "
        f"{anomaly_count / len(X_test) * 100:.2f}%"
    )

    print(
        f"Mean anomaly score : "
        f"{np.mean(scores):.2f}"
    )

    print(
        f"Max anomaly score  : "
        f"{np.max(scores):.2f}"
    )


if __name__ == "__main__":
    test_model()
