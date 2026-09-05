from sqlalchemy.orm import Session
from backend.app.models import models


def update_sensor_health(db: Session, station_id: str):
    recent_readings = (
        db.query(models.Reading)
        .filter(models.Reading.station_id == station_id)
        .order_by(models.Reading.timestamp.desc())
        .limit(100)
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

    sensors = (
        db.query(models.Sensor)
        .filter(models.Sensor.station_id == station_id)
        .all()
    )

    for sensor in sensors:

        anomaly_count = sum(
            1
            for anomaly in recent_anomalies
            if anomaly.sensor_id == sensor.id
        )
        
        normal_readings = total_readings - anomaly_count
        
        print(
        "SENSOR:",
        sensor.id,
        sensor.sensor_type,
        "HEALTH OBJECT:",
        sensor.health,
        "ANOMALIES:",
        anomaly_count,
        "TOTAL:",
        total_readings
        )

        sensor.health.normal_readings = normal_readings

        sensor.health.health_score = (
            normal_readings / total_readings
        ) * 100