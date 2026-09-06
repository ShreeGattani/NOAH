from pathlib import Path
import numpy as np
import pandas as pd

from ml.preprocessing.clean import load_inmet_csv, clean_and_flag_records
from ml.preprocessing.features import extract_ml_features, ML_FEATURE_FIELDS
from ml.models.isolation_forest import NoahIsolationForest


def evaluate_2023_data(
    test_csv_path: str = "archive/2023.csv",
    model_path: str = "models/isolation_forest.joblib",
    max_test_rows: int = 100000
):
    print("=" * 60)
    print("NOAH AI - Model Evaluation on 2023 Test Data")
    print("=" * 60)

    # 1. Load Trained Model & Scaler Artifact
    print("\n[1/5] Loading trained NoahIsolationForest model & scaler...")
    model = NoahIsolationForest.load(model_path)
    print(f"✓ Model loaded successfully from {model_path}")
    print(f"✓ Model scaler is fitted: {model.scaler.is_fitted if model.scaler else False}")

    # 2. Load 2023 Test Data
    print(f"\n[2/5] Loading 2023 test data from {test_csv_path} (max {max_test_rows:,} rows)...")
    raw_test = load_inmet_csv(test_csv_path, max_rows=max_test_rows)
    print(f"✓ Loaded {len(raw_test):,} raw 2023 test records.")

    # 3. Clean Records
    print("\n[3/5] Cleaning test records...")
    cleaned_test = clean_and_flag_records(raw_test)
    print(f"✓ Cleaned {len(cleaned_test):,} test records.")

    # 4. Extract Features using the TRAINED Scaler (Zero Data Leakage)
    print("\n[4/5] Extracting 22 ML features using training scaler...")
    df_features = extract_ml_features(
        cleaned_test,
        scaler=model.scaler,     # REUSES training scaler!
        include_metadata=True,
        as_dataframe=True
    )

    X_test = df_features[ML_FEATURE_FIELDS].to_numpy()
    print(f"✓ Test matrix shape: {X_test.shape}")

    # 5. Predict & Compute Relative Anomaly Scores (0-100)
    print("\n[5/5] Scoring test observations with Isolation Forest...")
    preds = model.predict(X_test)            # +1 = Normal, -1 = Anomaly
    scores = model.anomaly_score(X_test)     # 0 to 100 relative percentile score

    df_features["anomaly_score"] = scores
    df_features["is_anomaly"] = (preds == -1)

    # =========================================================
    # Evaluation Results & Summary Statistics
    # =========================================================
    num_anomalies = np.sum(preds == -1)
    anomaly_pct = (num_anomalies / len(preds)) * 100.0

    print("\n" + "=" * 60)
    print("EVALUATION RESULTS (2023 TEST DATA)")
    print("=" * 60)
    print(f"Total Test Observations Evaluated: {len(X_test):,}")
    print(f"Normal Observations (+1):          {len(preds) - num_anomalies:,} ({100 - anomaly_pct:.2f}%)")
    print(f"Flagged Anomalies (-1):            {num_anomalies:,} ({anomaly_pct:.2f}%)")
    print(f"Average Anomaly Score:             {np.mean(scores):.2f} / 100")
    print(f"Maximum Anomaly Score:             {np.max(scores):.2f} / 100")
    print("=" * 60)

    # Display Top 5 Most Severe Anomalies Detected in 2023 with all 22 features
    print("\n🔥 TOP 5 MOST EXTREME ANOMALIES DETECTED IN 2023 (ALL 22 FEATURES):")
    top_anomalies = df_features.sort_values(by="anomaly_score", ascending=False).head(5)
    
    for idx, row in top_anomalies.iterrows():
        print("\n" + "-" * 70)
        print(f"📍 Station: {row['station_id']} | Timestamp: {row['timestamp']} | Anomaly Score: {row['anomaly_score']:.1f} / 100")
        print("-" * 70)
        print("  [1] Scaled Direct Readings:")
        print(f"      • scaled_temperature:          {row['scaled_temperature']:>7.3f}")
        print(f"      • scaled_humidity:             {row['scaled_humidity']:>7.3f}")
        print(f"      • scaled_pressure:             {row['scaled_pressure']:>7.3f}")
        print(f"      • scaled_dew_point:            {row['scaled_dew_point']:>7.3f}")
        
        print("  [2] Scaled 1h Deltas:")
        print(f"      • scaled_temp_delta_1h:        {row['scaled_temp_delta_1h']:>7.3f}")
        print(f"      • scaled_humidity_delta_1h:    {row['scaled_humidity_delta_1h']:>7.3f}")
        print(f"      • scaled_pressure_delta_1h:    {row['scaled_pressure_delta_1h']:>7.3f}")
        
        print("  [3] Scaled 3h Rolling Statistics:")
        print(f"      • scaled_temp_rolling_mean_3h: {row['scaled_temp_rolling_mean_3h']:>7.3f} | std: {row['scaled_temp_rolling_std_3h']:>7.3f}")
        print(f"      • scaled_hum_rolling_mean_3h:  {row['scaled_humidity_rolling_mean_3h']:>7.3f} | std: {row['scaled_humidity_rolling_std_3h']:>7.3f}")
        print(f"      • scaled_pres_rolling_mean_3h: {row['scaled_pressure_rolling_mean_3h']:>7.3f} | std: {row['scaled_pressure_rolling_std_3h']:>7.3f}")
        
        print("  [4] Temporal & Spatial Encoding:")
        print(f"      • hour_sin: {row['hour_sin']:>6.3f} | hour_cos: {row['hour_cos']:>6.3f} | month_sin: {row['month_sin']:>6.3f} | month_cos: {row['month_cos']:>6.3f}")
        print(f"      • latitude: {row['latitude']:>7.3f} | longitude: {row['longitude']:>7.3f} | altitude: {row['altitude']:>7.1f}m")
        
        print("  [5] Environmental Drivers:")
        print(f"      • rainfall: {row['rainfall']:>6.1f} mm/h | wind_speed: {row['wind_speed']:>5.1f} m/s")

    return df_features


if __name__ == "__main__":
    evaluate_2023_data()

