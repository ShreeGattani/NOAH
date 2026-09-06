from backend.app.models import models
from backend.app.schemas import schemas
# from ml.preprocessing.features import get_features

def process_reading(reading: schemas.WeatherReading, readings: list[models.Reading], station: models.Station) -> schemas.AnomalyResult:

    features = get_features(reading, readings, station)
    
    result = analyse(features)
    
    return schemas.AnomalyResult(
        timestamp=reading.timestamp,
        station_id=reading.station_id,
        anomaly_score=result.anomaly_score,
        is_anomaly=result.is_anomaly,
        anomaly_type=result.anomaly_type,
        severity=result.severity,
        confidence=result.confidence,
        reason=result.reason,
        recommendation=result.recommendation
    
)