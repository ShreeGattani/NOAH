from sqlalchemy.orm import Session
from backend.app.models import models
from backend.app.schemas import schemas


def get_or_create_station(
    db: Session,
    reading: schemas.WeatherReading
):
    station = (
        db.query(models.Station)
        .filter(models.Station.station_id == reading.station_id)
        .first()
    )

    if station is not None:
        return station

    # Create station
    station = models.Station(
        station_id=reading.station_id,
        station_name=reading.station_name or f"STATION_{reading.station_id}",
        latitude=reading.latitude,
        longitude=reading.longitude,
        altitude=reading.altitude
    )

    db.add(station)
    db.flush()  
    
    sensor_types = [
        "temperature",
        "humidity",
        "pressure",
        "rainfall",
        "wind_speed"
    ]

    for sensor_type in sensor_types:
        sensor = models.Sensor(
            station_id=station.station_id,
            sensor_type=sensor_type,
            status="ACTIVE"
        )

        db.add(sensor)
        db.flush()

        health = models.SensorHealth(
            sensor_id=sensor.id,
            health_score=100.0,
            health_window_size=100,
            normal_readings=0
        )

        db.add(health)

    return station
