


"""
Raw Dataset Loader & Cleaner (ml/preprocessing/clean.py)

Ingests raw INMET Automatic Weather Station CSV datasets, normalizes Portuguese 
decimal formatting ('29,5' -> 29.5), parses ISO 8601 UTC timestamps, extracts station
metadata, flags missing values, and calculates data_quality_score.
"""

import os
import csv
import re
from typing import List, Dict, Any, Optional, Union


def parse_portuguese_float(val: Any) -> Optional[float]:
    """Converts Portuguese comma decimal strings (e.g. '29,5') into float (29.5)."""
    if val is None:
        return None
    val_str = str(val).strip().replace(",", ".")
    if not val_str or val_str.lower() in ["nan", "null", "none", "-9999", "-9999.0"]:
        return None
    try:
        return float(val_str)
    except ValueError:
        return None


def parse_inmet_timestamp(date_str: str, time_str: str) -> Optional[str]:
    """Combines INMET Date and Time into ISO 8601 UTC timestamp ('2024-01-01T00:00:00Z'). Returns None if unparseable."""
    d_clean = date_str.strip().replace("/", "-")
    m_date1 = re.search(r"(\d{4})[-/](\d{1,2})[-/](\d{1,2})", d_clean)
    m_date2 = re.search(r"(\d{1,2})[-/](\d{1,2})[-/](\d{4})", d_clean)
    
    if m_date1:
        yyyy, mm, dd = m_date1.group(1), int(m_date1.group(2)), int(m_date1.group(3))
        iso_date = f"{yyyy}-{mm:02d}-{dd:02d}"
    elif m_date2:
        dd, mm, yyyy = int(m_date2.group(1)), int(m_date2.group(2)), m_date2.group(3)
        iso_date = f"{yyyy}-{mm:02d}-{dd:02d}"
    else:
        return None

    t_digits = re.sub(r"\D", "", str(time_str or ""))
    if len(t_digits) == 1 or len(t_digits) == 2:
        hour = int(t_digits)
    elif len(t_digits) == 3:
        hour = int(t_digits[0])
    elif len(t_digits) >= 4:
        hour = int(t_digits[:2])
    else:
        return None

    return f"{iso_date}T{hour % 24:02d}:00:00Z"



def get_col_val(row_dict: Dict[str, str], *possible_keys: str) -> Optional[str]:
    """Helper to retrieve column values matching multiple possible INMET headers."""
    for key in possible_keys:
        if key in row_dict and row_dict[key]:
            return row_dict[key]
        for rk, rv in row_dict.items():
            if key.lower() in rk.lower() and rv:
                return rv
    return None


def parse_raw_row_to_dict(row: List[str], header: List[str]) -> Optional[Dict[str, Any]]:
    """Converts a single raw INMET CSV row into the standardized dictionary."""
    col_dict = {header[i].strip(): row[i].strip() for i in range(min(len(header), len(row)))}
    
    station_id = get_col_val(col_dict, "CODIGO (WMO)", "CD_ESTACAO", "station_id", "Codigo")
    if not station_id:
        return None
    
    date_raw = get_col_val(col_dict, "Data", "DATA (YYYY-MM-DD)", "DATA (YYYY/MM/DD)", "DATA", "Date") or ""
    time_raw = get_col_val(col_dict, "Hora UTC", "HORA (UTC)", "HORA UTC", "Hora", "Time") or ""
    timestamp_iso = parse_inmet_timestamp(date_raw, time_raw)

    temp_str = get_col_val(col_dict, "TEMPERATURA DO AR - BULBO SECO, HORARIA (°C)", "TEMPERATURA DO AR - BULBO SECO (°C)", "TEMPERATURA")
    rh_str = get_col_val(col_dict, "UMIDADE RELATIVA DO AR, HORARIA (%)", "UMIDADE RELATIVA DO AR (%)", "UMIDADE RELATIVA")
    press_str = get_col_val(col_dict, "PRESSAO ATMOSFERICA AO NIVEL DA ESTACAO, HORARIA (mB)", "PRESSAO ATMOSFERICA")
    dew_str = get_col_val(col_dict, "TEMPERATURA DO PONTO DE ORVALHO (°C)", "TEMPERATURA DO PONTO DE ORVALHO", "PONTO DE ORVALHO", "DEW POINT")
    rain_str = get_col_val(col_dict, "PRECIPITAÇÃO TOTAL, HORÁRIO (mm)", "PRECIPITACAO TOTAL (mm)", "PRECIPITACAO")
    wind_str = get_col_val(col_dict, "VENTO, VELOCIDADE HORARIA (m/s)", "VENTO, VELOCIDADE (m/s)", "VELOCIDADE")

    return {
        "timestamp": timestamp_iso,
        "station_id": str(station_id),
        "station_name": str(get_col_val(col_dict, "ESTACAO", "Nome") or f"STATION_{station_id}"),
        "latitude": parse_portuguese_float(get_col_val(col_dict, "LATITUDE")),
        "longitude": parse_portuguese_float(get_col_val(col_dict, "LONGITUDE")),
        "altitude": parse_portuguese_float(get_col_val(col_dict, "ALTITUDE")),
        "temperature": parse_portuguese_float(temp_str),
        "humidity": parse_portuguese_float(rh_str),
        "pressure": parse_portuguese_float(press_str),
        "observed_dew_point": parse_portuguese_float(dew_str),
        "rainfall": parse_portuguese_float(rain_str),
        "wind_speed": parse_portuguese_float(wind_str)
    }


def clean_and_flag_records(raw_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Attaches missingness flags, 5-channel data_quality_score, and deduplicates records."""
    cleaned = []
    seen_keys = set()
    
    for r in raw_records:
        item = dict(r)
        
        is_temp_miss = (item.get("temperature") is None)
        is_rh_miss = (item.get("humidity") is None)
        is_press_miss = (item.get("pressure") is None)
        is_rain_miss = (item.get("rainfall") is None)
        is_wind_miss = (item.get("wind_speed") is None)
        is_time_miss = (item.get("timestamp") is None)
        
        item["is_missing_temp"] = is_temp_miss
        item["is_missing_humidity"] = is_rh_miss
        item["is_missing_pressure"] = is_press_miss
        item["is_missing_rainfall"] = is_rain_miss
        item["is_missing_wind_speed"] = is_wind_miss
        item["is_missing_timestamp"] = is_time_miss
        
        # 5-channel telemetry data quality score
        valid_count = 5 - (is_temp_miss + is_rh_miss + is_press_miss + is_rain_miss + is_wind_miss)
        item["data_quality_score"] = round((valid_count / 5.0) * 100.0, 1)
        
        # Deduplication on (station_id, timestamp)
        dedup_key = (item.get("station_id"), item.get("timestamp"))
        if dedup_key in seen_keys and item.get("timestamp") is not None:
            continue
        seen_keys.add(dedup_key)
        
        cleaned.append(item)
        
    return cleaned



def load_inmet_csv(
    file_path: str, 
    max_rows: Optional[int] = None, 
    skip_rows: int = 0,
    station_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Loads an INMET CSV file into standardized dictionaries, optionally skipping initial valid rows."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file not found at: {file_path}")

    records = []
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        try:
            header = next(reader)
        except StopIteration:
            return records

        parsed_count = 0
        kept_count = 0
        for row in reader:
            if max_rows and kept_count >= max_rows:
                break
            rec = parse_raw_row_to_dict(row, header)
            if rec:
                if station_filter and rec["station_id"] != station_filter:
                    continue
                parsed_count += 1
                if parsed_count <= skip_rows:
                    continue
                records.append(rec)
                kept_count += 1

    return records


def load_year_range(
    archive_dir: str, 
    start_year: int, 
    end_year: int, 
    max_rows: Optional[int] = None, 
    skip_rows_per_year: int = 0,
    station_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Loads observations across a multi-year range with a 3-row warm-up buffer to eliminate boundary artifacts."""
    all_records = []
    years = list(range(start_year, end_year + 1))
    rows_per_year = (max_rows // len(years)) if (max_rows and len(years) > 0) else max_rows

    # Warm-up buffer offset: load 3 extra historical rows prior to offset if skip_rows > 0
    actual_skip = max(0, skip_rows_per_year - 3) if skip_rows_per_year > 0 else 0
    actual_max = (rows_per_year + (skip_rows_per_year - actual_skip)) if rows_per_year else None

    for y in years:
        year_file = os.path.join(archive_dir, f"{y}.csv")
        if os.path.exists(year_file):
            recs = load_inmet_csv(
                year_file, 
                max_rows=actual_max, 
                skip_rows=actual_skip, 
                station_filter=station_filter
            )
            all_records.extend(recs)

    return all_records




def get_clean_data(
    year: Optional[int] = None,
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
    station_id: Optional[str] = None,
    max_rows: Optional[int] = 10000,
    with_features: bool = False,
    as_dataframe: bool = False,
    export_csv_path: Optional[str] = None,
    archive_dir: str = "archive"
) -> Union[List[Dict[str, Any]], Any]:
    """
    Primary Raw Data Loading API.
    
    Parameters:
        max_rows (Optional[int]): Cap on rows (default 10,000). Set max_rows=None to process 100% of data.
        with_features (bool): If True, routes through features.py for the 22 ML features.
        as_dataframe (bool): If True, returns pandas.DataFrame.
        export_csv_path (str): Optional path to export CSV.
    """
    abs_archive = os.path.abspath(archive_dir)

    if year is not None:
        file_path = os.path.join(abs_archive, f"{year}.csv")
        raw_records = load_inmet_csv(file_path, max_rows=max_rows, station_filter=station_id)
    elif start_year is not None and end_year is not None:
        raw_records = load_year_range(abs_archive, start_year, end_year, max_rows=max_rows, station_filter=station_id)
    else:
        file_path = os.path.join(abs_archive, "2024.csv")
        raw_records = load_inmet_csv(file_path, max_rows=max_rows, station_filter=station_id)

    cleaned_records = clean_and_flag_records(raw_records)

    if with_features:
        from .features import extract_ml_features
        final_records = extract_ml_features(cleaned_records, max_rows=max_rows)
    else:
        final_records = cleaned_records

    if export_csv_path:
        if final_records:
            fieldnames = list(final_records[0].keys())
            with open(export_csv_path, mode="w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(final_records)

    if as_dataframe:
        import pandas as pd
        return pd.DataFrame(final_records)

    return final_records