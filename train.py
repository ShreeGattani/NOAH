from __future__ import annotations

from pathlib import Path

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


# =========================================================
# Configuration
# =========================================================

TRAIN_START_YEAR = 2018
TRAIN_END_YEAR = 2022

ARCHIVE_DIR = Path("archive")
MODEL_DIR = Path("models")

MODEL_PATH = MODEL_DIR / "isolation_forest.joblib"
SCALER_PATH = MODEL_DIR / "feature_scaler.pkl"


# =========================================================
# Training
# =========================================================

def train_model() -> None:

    print("=" * 60)
    print("SkyGuard AI - Isolation Forest Training")
    print("=" * 60)

    # -----------------------------------------------------
    # 1. Load 2018-2022 historical data
    # -----------------------------------------------------

    print(
        f"\n[1/6] Loading training data "
        f"({TRAIN_START_YEAR}-{TRAIN_END_YEAR})..."
    )

    raw_records = load_year_range(
        str(ARCHIVE_DIR),
        TRAIN_START_YEAR,
        TRAIN_END_YEAR,
    )

    if not raw_records:
        raise RuntimeError(
            "No training records were loaded."
        )

    print(
        f"Loaded {len(raw_records):,} raw records."
    )

    # -----------------------------------------------------
    # 2. Clean records
    # -----------------------------------------------------

    print("\n[2/6] Cleaning training records...")

    cleaned_records = clean_and_flag_records(
        raw_records
    )

    if not cleaned_records:
        raise RuntimeError(
            "No records remain after cleaning."
        )

    print(
        f"Cleaned {len(cleaned_records):,} records."
    )

    # -----------------------------------------------------
    # 3. Identify valid training observations
    # -----------------------------------------------------

    print(
        "\n[3/6] Identifying complete training observations..."
    )

    # We want the feature extractor to see the COMPLETE
    # historical sequence so that its previous-record
    # deltas and rolling windows have proper historical
    # context.
    #
    # However, we only want records with complete
    # temperature, humidity and pressure values to become
    # actual Isolation Forest training samples.

    valid_keys = {
        (
            record.get("station_id"),
            record.get("timestamp"),
        )
        for record in cleaned_records
        if record.get("data_quality_score") == 100.0
    }

    if not valid_keys:
        raise RuntimeError(
            "No complete T/H/P training observations found."
        )

    print(
        f"Complete T/H/P observations: "
        f"{len(valid_keys):,}"
    )

    # -----------------------------------------------------
    # 4. Extract 22 ML features and FIT scaler
    # -----------------------------------------------------

    print(
        "\n[4/6] Extracting 22 ML features..."
    )

    print(
        "Fitting FeatureScaler ONLY on 2018-2022..."
    )

    feature_records, scaler = extract_ml_features(
        cleaned_records,
        include_metadata=True,
        scaler=None,
        return_scaler=True,
    )

    if not feature_records:
        raise RuntimeError(
            "Feature extraction produced no records."
        )

    if scaler is None or not scaler.is_fitted:
        raise RuntimeError(
            "FeatureScaler was not fitted correctly."
        )

    print(
        f"Generated {len(feature_records):,} "
        f"feature records."
    )

    # -----------------------------------------------------
    # 5. Build the training matrix
    # -----------------------------------------------------

    print(
        "\n[5/6] Building training matrix..."
    )

    # Match feature records back to the complete
    # observations identified above.
    #
    # This works because extract_ml_features() preserves
    # timestamp and station_id when include_metadata=True.

    valid_feature_records = [
        record
        for record in feature_records
        if (
            record.get("station_id"),
            record.get("timestamp"),
        ) in valid_keys
    ]

    if not valid_feature_records:
        raise RuntimeError(
            "No valid feature records matched "
            "the complete training observations."
        )

    # Convert the 22 feature dictionaries into the
    # NumPy matrix expected by Isolation Forest.
    X_train = np.asarray(
        [
            [
                record[field]
                for field in ML_FEATURE_FIELDS
            ]
            for record in valid_feature_records
        ],
        dtype=float,
    )

    if X_train.ndim != 2:
        raise RuntimeError(
            f"Expected a 2D training matrix, "
            f"got shape {X_train.shape}."
        )

    if X_train.shape[1] != 22:
        raise RuntimeError(
            f"Expected 22 ML features, "
            f"got {X_train.shape[1]}."
        )

    if not np.isfinite(X_train).all():
        raise RuntimeError(
            "Training matrix contains NaN or infinite values."
        )

    print(
        f"Training matrix shape: {X_train.shape}"
    )

    # -----------------------------------------------------
    # 6. Train and save Isolation Forest
    # -----------------------------------------------------

    print(
        "\n[6/6] Training NoahIsolationForest..."
    )

    model = NoahIsolationForest(
        n_estimators=200,
        contamination=0.01,
        random_state=42,
    )

    model.fit(
        X=X_train,
        feature_columns=list(ML_FEATURE_FIELDS),
        scaler=scaler,
    )

    print(
        "Isolation Forest training complete."
    )

    # Create models directory if necessary.
    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Save complete trained model.
    model.save(MODEL_PATH)

    # Save fitted scaler separately for easy access
    # by the realtime/backend pipeline.
    joblib.dump(
        scaler,
        SCALER_PATH,
    )

    print(
        f"\nModel saved to:  {MODEL_PATH}"
    )

    print(
        f"Scaler saved to: {SCALER_PATH}"
    )

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)

    print(
        f"\nFeatures used: {len(ML_FEATURE_FIELDS)}"
    )

    print(
        f"Training observations: {len(X_train):,}"
    )

    print("\nSaved artifacts:")

    print(
        f"  - {MODEL_PATH}"
    )

    print(
        f"  - {SCALER_PATH}"
    )

    print(
        "\nThe SAME fitted scaler must be reused for:"
    )

    print("  - 2023-2024 test data")
    print("  - Real-time inference")


# =========================================================
# Entry point
# =========================================================

if __name__ == "__main__":
    train_model()