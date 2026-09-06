from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from ml.preprocessing.clean import load_year_range, clean_and_flag_records
from ml.preprocessing.features import extract_ml_features, ML_FEATURE_FIELDS
from ml.models.isolation_forest import NoahIsolationForest
from ml.anomaly_fusion import fuse_anomaly_evidence
from ml.classification.classifier import classify


# P2/P3 files are inside the folder named "detection.py"


from ml.detection import temporal
from ml.detection import spatial
from ml.detection import cross_sensor

ARCHIVE_DIR = Path("archive")
MODEL_PATH = Path("models/isolation_forest.joblib")
SCALER_PATH = Path("models/feature_scaler.pkl")

TEST_YEAR = 2023
TEST_SAMPLE_SIZE = 10_000


def main():
    print("=" * 70)
    print("NOAH AI - END-TO-END P2 + P3 + P4 EVALUATION")
    print("=" * 70)

    # =========================================================
    # 1. Load model + scaler
    # =========================================================

    print("\n[1/7] Loading trained model...")

    model = NoahIsolationForest.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    print("✓ Model loaded")
    print("✓ Scaler loaded")

    # =========================================================
    # 2. Load and clean 2023 data
    # =========================================================

    print("\n[2/7] Loading 2023 test data...")

    raw_records = load_year_range(
        str(ARCHIVE_DIR),
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

    # =========================================================
    # 3. Inject synthetic anomalies
    # =========================================================

    print("\n[3/7] Injecting synthetic anomalies...")

    anomaly_indices = [1000, 2000, 3000, 4000]

    valid_records[1000]["temperature"] = 60.0

    valid_records[2000]["humidity"] = 5.0

    valid_records[3000]["pressure"] = 900.0

    valid_records[4000]["temperature"] = 60.0
    valid_records[4000]["humidity"] = 5.0

    print("✓ Injected 4 known anomalies")

    # =========================================================
    # Convert cleaned records to DataFrame for P2/P3
    # =========================================================

    weather = pd.DataFrame(valid_records)

    weather["timestamp"] = pd.to_datetime(
        weather["timestamp"],
        utc=True,
        errors="coerce",
    )

    # =========================================================
    # 4. Run P2 + P3
    # =========================================================

    print("\n[4/7] Running P2 temporal detection...")

    temporal_results = temporal.detect_temporal_anomalies(weather)
    temporal_output = temporal.format_temporal_output(temporal_results)

    print(f"✓ P2 processed {len(temporal_output):,} observations")

    # ---------------------------------------------------------

    print("\n[4/7] Running P3 spatial detection...")

    spatial_results = spatial.run_spatial_detection(weather)

    print(f"✓ P3 spatial processed {len(spatial_results):,} observations")

    # ---------------------------------------------------------

    print("\n[4/7] Running P3 cross-sensor detection...")

    cross_sensor_results = cross_sensor.run_cross_sensor_checks(weather)

    print(
        f"✓ P3 cross-sensor processed "
        f"{len(cross_sensor_results):,} observations"
    )

    # =========================================================
    # 5. Run P4 ML detector
    # =========================================================

    print("\n[5/7] Running P4 Isolation Forest...")

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

    ml_scores = model.anomaly_score(X_test)

    print(f"✓ P4 ML processed {len(ml_scores):,} observations")

    # =========================================================
    # Convert P3 DataFrames into lookup dictionaries
    # =========================================================

    spatial_lookup = {}

    for _, row in spatial_results.iterrows():

        key = (
            str(row["station_id"]),
            pd.Timestamp(row["timestamp"]),
        )

        spatial_lookup[key] = {
            "temperature": {
                "score": float(row["temperature_spatial_score"]),
                "neighbor_count": int(row["temperature_neighbor_count"]),
                "evidence_strength": float(
                    row["temperature_spatial_evidence_strength"]
                ),
                "neighbor_reference": row[
                    "temperature_neighbor_reference"
                ],
            },
            "humidity": {
                "score": float(row["humidity_spatial_score"]),
                "neighbor_count": int(row["humidity_neighbor_count"]),
                "evidence_strength": float(
                    row["humidity_spatial_evidence_strength"]
                ),
                "neighbor_reference": row[
                    "humidity_neighbor_reference"
                ],
            },
            "pressure": {
                "score": float(row["pressure_spatial_score"]),
                "neighbor_count": int(row["pressure_neighbor_count"]),
                "evidence_strength": float(
                    row["pressure_spatial_evidence_strength"]
                ),
                "neighbor_reference": row[
                    "pressure_neighbor_reference"
                ],
            },
        }

    cross_sensor_lookup = {}

    for _, row in cross_sensor_results.iterrows():

        key = (
            str(row["station_id"]),
            pd.Timestamp(row["timestamp"]),
        )

        cross_sensor_lookup[key] = {
            "temperature": {
                "score": float(
                    row["temperature_cross_sensor_score"]
                ),
            },
            "humidity": {
                "score": float(
                    row["humidity_cross_sensor_score"]
                ),
            },
            "dew_point_expected": row["dew_point_expected"],
            "dew_point_observed": row["dew_point_observed"],
            "dew_point_residual": row["dew_point_residual"],
            "independent_observation_available": bool(
                row["dew_point_independent_observation_available"]
            ),
        }

    temporal_lookup = {
        (
            str(record["station_id"]),
            pd.Timestamp(record["timestamp"]),
        ): record
        for record in temporal_output
    }

    # =========================================================
    # 6. Fuse P2 + P3 + P4
    # =========================================================

    print("\n[6/7] Running P4 evidence fusion + classification...")

    final_results = []

    for index, record in enumerate(valid_records):

        key = (
            str(record["station_id"]),
            pd.Timestamp(record["timestamp"]),
        )

        temporal_evidence = temporal_lookup.get(key, {})
        spatial_evidence = spatial_lookup.get(key, {})
        cross_sensor_evidence = cross_sensor_lookup.get(key, {})

        fused = fuse_anomaly_evidence(
            ml_score=float(ml_scores[index]),
            temporal=temporal_evidence,
            spatial=spatial_evidence,
            cross_sensor=cross_sensor_evidence,
        )

        classification = classify(
            temporal=temporal_evidence,
            spatial=spatial_evidence,
            cross_sensor=cross_sensor_evidence,
            final_score=fused["final_anomaly_score"],
        )

        final_results.append(
            {
                **fused,
                **classification,
            }
        )

    print(f"✓ Fusion completed for {len(final_results):,} observations")

    # =========================================================
    # 7. Display results for injected anomalies
    # =========================================================

    print("\n[7/7] Synthetic anomaly results")

    print("\n" + "=" * 70)
    print("END-TO-END RESULTS")
    print("=" * 70)

    for index in anomaly_indices:

        result = final_results[index]

        print(f"\n{'-' * 60}")
        print(f"Injected anomaly at index {index}")
        print(f"{'-' * 60}")

        print(
            f"ML anomaly score        : "
            f"{result['ml_anomaly_score']:.2f}"
        )

        print(
            f"Temporal anomaly score  : "
            f"{result['temporal_anomaly_score']:.2f}"
        )

        print(
            f"Spatial anomaly score   : "
            f"{result['spatial_anomaly_score']:.2f}"
        )

        print(
            f"Cross-sensor score      : "
            f"{result['cross_sensor_anomaly_score']:.2f}"
        )

        print(
            f"FINAL anomaly score     : "
            f"{result['final_anomaly_score']:.2f}"
        )

        print(
            f"Severity                : "
            f"{result['severity']}"
        )

        print(
            f"Anomaly type            : "
            f"{result['anomaly_type']}"
        )

        print(
            f"Event type              : "
            f"{result['event_type']}"
        )

        print(
            f"Confidence              : "
            f"{result['confidence']:.2f}%"
        )

        print(
            f"Recommendation          : "
            f"{result['recommendation']}"
        )

        print(
            f"Temporal flags          : "
            f"{result['temporal_flags']}"
        )

        print(
            f"Cross-sensor available : "
            f"{result['cross_sensor_available']}"
        )

    print("\n" + "=" * 70)
    print("END-TO-END TEST COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()