from backend.app.schemas import schemas

def process_reading(reading: schemas.WeatherReading) -> schemas.Anomaly:

    result = analyse(reading)
    return schemas.Anomaly(
        timestamp=reading.timestamp,
        station_id=reading.station_id,
        anomaly_score=result.anomaly_score,
        is_anomaly=result.is_anomly,
        anomaly_type=result.anomaly_type,
        severity=result.severity,
        confidence=result.confidence,
        reason=result.reason,
        recommendation=result.recommendation
    )