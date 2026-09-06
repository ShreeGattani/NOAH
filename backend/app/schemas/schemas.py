from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class WeatherReading(BaseModel):
    timestamp: datetime
    station_id: str
    station_name: str | None = None
    latitude: float
    longitude: float
    altitude: float | None = None

    temperature: float | None = None
    humidity: float | None = None
    pressure: float | None = None
    rainfall: float | None = None
    wind_speed: float | None = None
    
class AnomalyClassification(str, Enum):
    WEATHER_EVENT = "WEATHER_EVENT"
    SENSOR_FAULT = "SENSOR_FAULT"
    
class AnomalyResult(BaseModel):
    timestamp: datetime
    station_id: str

    sensor_types: list[str] = Field(default_factory=list)

    anomaly_score: float
    is_anomaly: bool

    classification: AnomalyClassification | None = None
    classification_reason: str | None = None
    metric: str | None = None

    anomaly_type: str | None = None
    severity: str | None = None
    confidence: float | None = None
    reason: str | None = None
    recommendation: str | None = None