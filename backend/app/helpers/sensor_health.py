from sqlalchemy.orm import Session
from backend.app.models import models


def update_sensor_health(db: Session, station_id: str):
    sensors = (
        db.query(models.Sensor)
        .filter(models.Sensor.station_id == station_id)
        .all()
    )
    
    if not sensors:
        return

    window_size = sensors[0].health.health_window_size

    recent_readings = (
        db.query(models.Reading)
        .filter(models.Reading.station_id == station_id)
        .order_by(models.Reading.timestamp.desc())
        .limit(window_size)
        .all()
    )
    
    total_readings = len(recent_readings)

    if total_readings == 0:
        return

    reading_ids = [reading.id for reading in recent_readings]

    recent_anomalies = (
        db.query(models.Anomaly)
        .filter(
            models.Anomaly.station_id == station_id,
            models.Anomaly.reading_id.in_(reading_ids),
            models.Anomaly.sensor_id.isnot(None)
        )
        .all()
    )
    
    for sensor in sensors:

        anomaly_count = sum(
            1
            for anomaly in recent_anomalies
            if anomaly.sensor_id == sensor.id
        )
        
        normal_readings = total_readings - anomaly_count

        sensor.health.normal_readings = normal_readings

        sensor.health.health_score = (
            normal_readings / total_readings
        ) * 100
        
        if sensor.health.health_score >= 80:
            sensor.health.status = models.SensorHealthStatus.HEALTHY
        elif sensor.health.health_score >= 50:
            sensor.health.status = models.SensorHealthStatus.DEGRADED
        else:
            sensor.health.status = models.SensorHealthStatus.CRITICAL