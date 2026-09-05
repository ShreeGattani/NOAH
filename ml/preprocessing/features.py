"""
SkyGuard AI — ML Feature Engineering Module (Person 1 -> Person 4 Interface)

This module handles feature engineering on top of raw clean weather station records.
It returns STRICTLY the 22 features required for Machine Learning model input:

1. scaled_temperature
2. scaled_humidity
3. scaled_pressure
4. scaled_dew_point
5. scaled_temp_delta_1h
6. scaled_humidity_delta_1h
7. scaled_pressure_delta_1h
8. scaled_temp_rolling_mean_3h
9. scaled_humidity_rolling_mean_3h
10. scaled_pressure_rolling_mean_3h
11. scaled_temp_rolling_std_3h
12. scaled_humidity_rolling_std_3h
13. scaled_pressure_rolling_std_3h
14. hour_sin
15. hour_cos
16. month_sin
17. month_cos
18. latitude
19. longitude
20. altitude
21. rainfall
22. wind_speed
"""

import math
from datetime import datetime
from typing import List, Dict, Any, Optional

# The exact 22 ML feature field names required by Person 4 / ML model
ML_FEATURE_FIELDS = [
    "scaled_temperature",
    "scaled_humidity",
    "scaled_pressure",
    "scaled_dew_point",
    "scaled_temp_delta_1h",
    "scaled_humidity_delta_1h",
    "scaled_pressure_delta_1h",
    "scaled_temp_rolling_mean_3h",
    "scaled_humidity_rolling_mean_3h",
    "scaled_pressure_rolling_mean_3h",
    "scaled_temp_rolling_std_3h",
    "scaled_humidity_rolling_std_3h",
    "scaled_pressure_rolling_std_3h",
    "hour_sin",
    "hour_cos",
    "month_sin",
    "month_cos",
    "latitude",
    "longitude",
    "altitude",
    "rainfall",
    "wind_speed",
]


def compute_magnus_dew_point(temp: Optional[float], rh: Optional[float]) -> Optional[float]:
    """Computes Magnus Dew Point (°C) given dry bulb temperature and relative humidity."""
    if temp is None or rh is None or rh <= 0:
        return temp
    a, b = 17.27, 237.7
    try:
        alpha = ((a * temp) / (b + temp)) + math.log(rh / 100.0)
        return round((b * alpha) / (a - alpha), 2)
    except (ValueError, ZeroDivisionError):
        return temp


class FeatureScaler:
    """Computes mean and std across dataset records to perform consistent z-score scaling."""
    
    def __init__(self):
        self.scaling_params: Dict[str, Dict[str, float]] = {}
        self.is_fitted = False

    def fit_transform(self, records: List[Dict[str, Any]], fields: List[str]) -> List[Dict[str, Any]]:
        """Fits scaling parameters on numerical fields and attaches z-score scaled keys."""
        for f in fields:
            vals = [r[f] for r in records if r.get(f) is not None]
            if vals:
                mean = sum(vals) / len(vals)
                var = sum((x - mean) ** 2 for x in vals) / len(vals)
                std = math.sqrt(var) if var > 1e-6 else 1.0
                self.scaling_params[f] = {"mean": mean, "std": std}
            else:
                self.scaling_params[f] = {"mean": 0.0, "std": 1.0}

        self.is_fitted = True
        
        scaled_records = []
        for r in records:
            item = dict(r)
            for f in fields:
                val = item.get(f)
                if val is not None:
                    p = self.scaling_params[f]
                    item[f"scaled_{f}"] = round((val - p["mean"]) / p["std"], 4)
                else:
                    item[f"scaled_{f}"] = 0.0
            scaled_records.append(item)

        return scaled_records


def extract_ml_features(
    records: List[Dict[str, Any]], 
    include_metadata: bool = False,
    as_dataframe: bool = False,
    export_csv_path: Optional[str] = None,
    max_rows: Optional[int] = None
) -> Any:
    """
    Primary Feature Engineering Function for Person 4 / ML Models.
    
    Takes raw clean dataset records (from dataset_loader.py) and computes:
    - Dew point (Magnus equation)
    - Backward 1-hour deltas (temp, humidity, pressure)
    - Backward 3-hour rolling mean & std (temp, humidity, pressure)
    - Cyclic sine/cosine time encodings (hour, month)
    - Consistent z-score feature scaling
    
    Parameters:
        include_metadata (bool): Optionally include 'timestamp' and 'station_id' for joining.
        as_dataframe (bool): If True, returns a pandas.DataFrame instead of List[Dict].
        export_csv_path (str): Optional path to export the 22 ML feature records as CSV.
        max_rows (Optional[int]): Cap on records to process. Set max_rows=None (default) to process 100% of all records.
        
    Returns ONLY the 22 ML feature fields requested for model input (Dict, DataFrame, or CSV).
    """
    if not records:
        if as_dataframe:
            import pandas as pd
            return pd.DataFrame()
        return []

    if max_rows and len(records) > max_rows:
        records = records[:max_rows]


    # Sort chronologically per station to guarantee zero future data leakage
    station_groups: Dict[str, List[Dict[str, Any]]] = {}
    for r in records:
        sid = r.get("station_id", "UNKNOWN")
        station_groups.setdefault(sid, []).append(r)

    enriched_records = []

    for sid, group in station_groups.items():
        # Sort strictly by timestamp
        sorted_group = sorted(group, key=lambda x: x.get("timestamp", ""))

        for i, curr in enumerate(sorted_group):
            item = dict(curr)
            
            # 1. Dew point calculation
            item["dew_point"] = compute_magnus_dew_point(
                item.get("temperature"), 
                item.get("humidity")
            )

            # 2. Backward 1-hour deltas
            prev_1h = sorted_group[i - 1] if i >= 1 else curr
            item["temp_delta_1h"] = round(item["temperature"] - prev_1h["temperature"], 2) if item.get("temperature") is not None and prev_1h.get("temperature") is not None else 0.0
            item["humidity_delta_1h"] = round(item["humidity"] - prev_1h["humidity"], 2) if item.get("humidity") is not None and prev_1h.get("humidity") is not None else 0.0
            item["pressure_delta_1h"] = round(item["pressure"] - prev_1h["pressure"], 2) if item.get("pressure") is not None and prev_1h.get("pressure") is not None else 0.0

            # 3. Backward 3-hour rolling window [t-2, t-1, t]
            window_3h = sorted_group[max(0, i - 2): i + 1]
            
            # Temperature rolling mean & std
            temp_vals = [w["temperature"] for w in window_3h if w.get("temperature") is not None]
            item["temp_rolling_mean_3h"] = round(sum(temp_vals) / len(temp_vals), 2) if temp_vals else item.get("temperature", 0.0)
            if len(temp_vals) > 1:
                m = item["temp_rolling_mean_3h"]
                var = sum((x - m) ** 2 for x in temp_vals) / len(temp_vals)
                item["temp_rolling_std_3h"] = round(math.sqrt(var), 3)
            else:
                item["temp_rolling_std_3h"] = 0.0

            # Humidity rolling mean & std
            rh_vals = [w["humidity"] for w in window_3h if w.get("humidity") is not None]
            item["humidity_rolling_mean_3h"] = round(sum(rh_vals) / len(rh_vals), 2) if rh_vals else item.get("humidity", 0.0)
            if len(rh_vals) > 1:
                m = item["humidity_rolling_mean_3h"]
                var = sum((x - m) ** 2 for x in rh_vals) / len(rh_vals)
                item["humidity_rolling_std_3h"] = round(math.sqrt(var), 3)
            else:
                item["humidity_rolling_std_3h"] = 0.0

            # Pressure rolling mean & std
            press_vals = [w["pressure"] for w in window_3h if w.get("pressure") is not None]
            item["pressure_rolling_mean_3h"] = round(sum(press_vals) / len(press_vals), 2) if press_vals else item.get("pressure", 0.0)
            if len(press_vals) > 1:
                m = item["pressure_rolling_mean_3h"]
                var = sum((x - m) ** 2 for x in press_vals) / len(press_vals)
                item["pressure_rolling_std_3h"] = round(math.sqrt(var), 3)
            else:
                item["pressure_rolling_std_3h"] = 0.0

            # 4. Cyclic Time Encodings
            ts_str = item.get("timestamp", "")
            try:
                dt = datetime.strptime(ts_str[:19], "%Y-%m-%dT%H:%M:%S")
                item["hour_sin"] = round(math.sin(2 * math.pi * dt.hour / 24.0), 4)
                item["hour_cos"] = round(math.cos(2 * math.pi * dt.hour / 24.0), 4)
                item["month_sin"] = round(math.sin(2 * math.pi * dt.month / 12.0), 4)
                item["month_cos"] = round(math.cos(2 * math.pi * dt.month / 12.0), 4)
            except ValueError:
                item["hour_sin"] = 0.0
                item["hour_cos"] = 1.0
                item["month_sin"] = 0.0
                item["month_cos"] = 1.0

            enriched_records.append(item)

    # 5. Fit z-score scaling on unscaled numerical features
    scale_targets = [
        "temperature", "humidity", "pressure", "dew_point",
        "temp_delta_1h", "humidity_delta_1h", "pressure_delta_1h",
        "temp_rolling_mean_3h", "humidity_rolling_mean_3h", "pressure_rolling_mean_3h",
        "temp_rolling_std_3h", "humidity_rolling_std_3h", "pressure_rolling_std_3h"
    ]
    scaler = FeatureScaler()
    scaled_dataset = scaler.fit_transform(enriched_records, scale_targets)

    # 6. Filter output to return STRICTLY the 22 ML features
    ml_output = []
    for r in scaled_dataset:
        feat_dict = {}
        
        # Optionally include station_id and timestamp metadata for joining
        if include_metadata:
            feat_dict["timestamp"] = r.get("timestamp")
            feat_dict["station_id"] = r.get("station_id")
            
        for key in ML_FEATURE_FIELDS:
            feat_dict[key] = r.get(key, 0.0)
            
        ml_output.append(feat_dict)

    if export_csv_path:
        import csv
        if ml_output:
            fieldnames = list(ml_output[0].keys())
            with open(export_csv_path, mode="w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(ml_output)
            print(f"Successfully exported {len(ml_output)} ML feature records to CSV: {export_csv_path}")

    if as_dataframe:
        import pandas as pd
        return pd.DataFrame(ml_output)

    return ml_output


