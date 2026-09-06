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
CHUNK_SIZE_PER_YEAR = 100000  # 100,000 records per year per iteration (500,000 records total per iteration)
TOTAL_ITERATIONS = 5          # Iterates 5 times: [0-100k], [100k-200k], [200k-300k], [300k-400k], [400k-500k]

ARCHIVE_DIR = Path("archive")
MODEL_DIR = Path("models")

MODEL_PATH = MODEL_DIR / "isolation_forest.joblib"
SCALER_PATH = MODEL_DIR / "feature_scaler.pkl"


# =========================================================
# Iterative Training Pipeline
# =========================================================

def train_model() -> None:

    print("=" * 60)
    print("NOAH AI - Iterative Chunk Isolation Forest Training")
    print("=" * 60)

    num_years = TRAIN_END_YEAR - TRAIN_START_YEAR + 1

    for iter_idx in range(TOTAL_ITERATIONS):
        skip_offset = iter_idx * CHUNK_SIZE_PER_YEAR
        chunk_max_rows = CHUNK_SIZE_PER_YEAR * num_years

        print("\n" + "=" * 60)
        print(f" ITERATION {iter_idx + 1} / {TOTAL_ITERATIONS}")
        print(f" Slicing rows {skip_offset:,} to {skip_offset + CHUNK_SIZE_PER_YEAR:,} per year ({TRAIN_START_YEAR}-{TRAIN_END_YEAR})")
        print(f" Target Chunk Size: {chunk_max_rows:,} records")
        print("=" * 60)

        # -----------------------------------------------------
        # 1. Load historical data chunk
        # -----------------------------------------------------

        print(f"\n[1/6] Loading data chunk (skipping first {skip_offset:,}/year)...")

        raw_records = load_year_range(
            str(ARCHIVE_DIR),
            TRAIN_START_YEAR,
            TRAIN_END_YEAR,
            max_rows=chunk_max_rows,
            skip_rows_per_year=skip_offset,
        )

        if not raw_records:
            print(f"\n[!] No more records found at offset {skip_offset:,}. Finishing iterative training loop.")
            break

        print(f"Loaded {len(raw_records):,} raw records.")

        # -----------------------------------------------------
        # 2. Clean records & flag missingness
        # -----------------------------------------------------

        print("\n[2/6] Cleaning raw records & flagging missingness...")

        cleaned_records = clean_and_flag_records(raw_records)

        if not cleaned_records:
            print(f"[!] No clean records in iteration {iter_idx + 1}. Skipping.")
            continue

        print(f"Cleaned {len(cleaned_records):,} records.")

        # -----------------------------------------------------
        # 3. Filter complete training observations
        # -----------------------------------------------------

        print("\n[3/6] Identifying complete 100% quality observations...")

        valid_keys = {
            (record.get("station_id"), record.get("timestamp"))
            for record in cleaned_records
            if record.get("data_quality_score") == 100.0
        }

        if not valid_keys:
            print(f"[!] No complete observations in iteration {iter_idx + 1}. Skipping.")
            continue

        print(f"Complete quality observations found: {len(valid_keys):,}")

        # -----------------------------------------------------
        # 4. Extract 22 ML features and FIT training FeatureScaler
        # -----------------------------------------------------

        print("\n[4/6] Extracting 22 ML features & fitting FeatureScaler...")

        feature_records, scaler = extract_ml_features(
            cleaned_records,
            include_metadata=True,
            scaler=None,
            return_scaler=True,
        )

        if not feature_records or scaler is None:
            print(f"[!] Feature extraction failed in iteration {iter_idx + 1}. Skipping.")
            continue

        print(f"Generated {len(feature_records):,} feature records.")

        # -----------------------------------------------------
        # 5. Build training matrix (NumPy)
        # -----------------------------------------------------

        print("\n[5/6] Building training feature matrix (X_train)...")

        valid_feature_records = [
            record for record in feature_records
            if (record.get("station_id"), record.get("timestamp")) in valid_keys
        ]

        if not valid_feature_records:
            print(f"[!] No matching feature records in iteration {iter_idx + 1}. Skipping.")
            continue

        X_train = np.asarray(
            [
                [record[field] for field in ML_FEATURE_FIELDS]
                for record in valid_feature_records
            ],
            dtype=float,
        )

        if X_train.ndim != 2 or X_train.shape[1] != 22:
            print(f"[!] Invalid shape {X_train.shape} in iteration {iter_idx + 1}. Skipping.")
            continue

        print(f"Training matrix shape: {X_train.shape}")

        # -----------------------------------------------------
        # 6. Train & Save NoahIsolationForest
        # -----------------------------------------------------

        print("\n[6/6] Training NoahIsolationForest model...")

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

        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        model.save(MODEL_PATH)
        joblib.dump(scaler, SCALER_PATH)

        print(f"\n✓ Iteration {iter_idx + 1}/{TOTAL_ITERATIONS} Complete!")
        print(f"  - Model Saved:  {MODEL_PATH}")
        print(f"  - Scaler Saved: {SCALER_PATH}")

    print("\n" + "=" * 60)
    print("ALL ITERATIONS COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    train_model()