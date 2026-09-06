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

# Load 500,000 records from each year (2,500,000 total records across 5 years)
RECORDS_PER_YEAR = 500_000

RANDOM_STATE = 42

ARCHIVE_DIR = Path("archive")
MODEL_DIR = Path("models")

MODEL_PATH = MODEL_DIR / "isolation_forest.joblib"
SCALER_PATH = MODEL_DIR / "feature_scaler.pkl"


# =========================================================
# Full 2.5M Dataset Training Pipeline
# =========================================================

def train_model() -> None:

    print("=" * 60)
    print("NOAH AI - Full 2.5M Record Isolation Forest Training")
    print(f"Dataset: {TRAIN_START_YEAR}-{TRAIN_END_YEAR} ({RECORDS_PER_YEAR:,} records/year)")
    print("=" * 60)

    num_years = TRAIN_END_YEAR - TRAIN_START_YEAR + 1
    total_target_records = RECORDS_PER_YEAR * num_years

    # -----------------------------------------------------
    # 1. Load full 500k records/year across 2018-2022
    # -----------------------------------------------------
    print(f"\n[1/5] Loading 500k records per year ({total_target_records:,} raw records total)...")

    raw_records = load_year_range(
        str(ARCHIVE_DIR),
        TRAIN_START_YEAR,
        TRAIN_END_YEAR,
        max_rows=total_target_records,
    )

    if not raw_records:
        raise RuntimeError("No raw records loaded from archive directory.")

    print(f"✓ Loaded {len(raw_records):,} raw records.")

    # -----------------------------------------------------
    # 2. Clean records & filter 100% quality observations
    # -----------------------------------------------------
    print("\n[2/5] Cleaning records & identifying complete 100% quality observations...")

    cleaned_records = clean_and_flag_records(raw_records)

    valid_keys = {
        (record.get("station_id"), record.get("timestamp"))
        for record in cleaned_records
        if record.get("data_quality_score") == 100.0
    }

    print(f"✓ Cleaned {len(cleaned_records):,} records.")
    print(f"✓ Complete quality observations found: {len(valid_keys):,} / {len(cleaned_records):,}")

    if not valid_keys:
        raise RuntimeError("No complete 100% quality observations found in training set.")

    # -----------------------------------------------------
    # 3. Extract 22 ML features & fit UNIFIED FeatureScaler
    # -----------------------------------------------------
    print("\n[3/5] Extracting 22 ML features & fitting global FeatureScaler...")

    feature_records, scaler = extract_ml_features(
        cleaned_records,
        include_metadata=True,
        scaler=None,
        return_scaler=True,
    )

    if not feature_records or scaler is None:
        raise RuntimeError("Feature extraction failed.")

    print(f"✓ Generated {len(feature_records):,} feature records.")
    print(f"✓ FeatureScaler fitted on {len(cleaned_records):,} observations across 22 features.")

    # -----------------------------------------------------
    # 4. Build complete training feature matrix (X_train)
    # -----------------------------------------------------
    print("\n[4/5] Building complete training feature matrix (X_train)...")

    valid_feature_records = [
        record for record in feature_records
        if (record.get("station_id"), record.get("timestamp")) in valid_keys
    ]

    X_train = np.asarray(
        [
            [record[field] for field in ML_FEATURE_FIELDS]
            for record in valid_feature_records
        ],
        dtype=np.float32,
    )

    if X_train.ndim != 2 or X_train.shape[1] != 22:
        raise ValueError(f"Invalid feature matrix shape: {X_train.shape}")

    print(f"✓ Training Matrix Shape: {X_train.shape} ({X_train.shape[0]:,} rows x {X_train.shape[1]} features)")

    # -----------------------------------------------------
    # 5. Train NoahIsolationForest ONCE on full dataset
    # -----------------------------------------------------
    print("\n[5/5] Training NoahIsolationForest model on full multi-year matrix...")

    model = NoahIsolationForest(
        n_estimators=200,
        contamination=0.01,
        random_state=RANDOM_STATE,
    )

    model.fit(
        X=X_train,
        feature_columns=list(ML_FEATURE_FIELDS),
        scaler=scaler,
    )

    # -----------------------------------------------------
    # Save final artifacts
    # -----------------------------------------------------
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    model.save(MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE & SAVED")
    print("=" * 60)
    print(f"Total Observations Loaded : {len(raw_records):,}")
    print(f"Complete Observations Used : {X_train.shape[0]:,}")
    print(f"Saved Model Artifact       : {MODEL_PATH}")
    print(f"Saved Feature Scaler       : {SCALER_PATH}")
    print("=" * 60)


if __name__ == "__main__":
    train_model()