from pydantic import BaseModel, Field
from datetime import datetime

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
    
    
class AnomalyResult(BaseModel):
    timestamp: datetime
    station_id: str
    sensor_types: list[str] = Field(default_factory=list)
    
    anomaly_score: float
    is_anomaly: bool
    
    anomaly_type: str | None
    severity: str | None
    confidence: float | None
    
    reason: str | None
    recommendation: str | None