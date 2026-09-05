from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.database.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.services.processing import process_reading
from backend.app.services.websocket import manager
from backend.app.helpers.stations import get_or_create_station
from backend.app.helpers.sensor_health import update_sensor_health


router = APIRouter(
    prefix="/readings",
    tags=["Readings"]
)

@router.post("", response_model=schemas.AnomalyResult, status_code=status.HTTP_201_CREATED)
async def post_readings(reading: schemas.WeatherReading, db: Session = Depends(get_db)):

    station = get_or_create_station(db, reading)
    readings = (
        db.query(models.Reading)
        .filter(models.Reading.station_id == reading.station_id)
        .order_by(models.Reading.timestamp.desc())
        .limit(6)
        .all()
    )

    readings.reverse()

    result = process_reading(reading, readings, station)

    db_reading = models.Reading(
        timestamp=reading.timestamp,
        station_id=reading.station_id,
        temperature=reading.temperature,
        humidity=reading.humidity,
        pressure=reading.pressure,
        rainfall=reading.rainfall,
        wind_speed=reading.wind_speed
    )

    db.add(db_reading)
    db.flush()

    if result.is_anomaly:

        for sensor_type in result.sensor_types:

            sensor = (
                db.query(models.Sensor)
                .filter(
                    models.Sensor.station_id == reading.station_id,
                    models.Sensor.sensor_type == sensor_type
                )
                .first()
            )

            if sensor is None:
                continue

            db_anomaly = models.Anomaly(
                timestamp=result.timestamp,
                station_id=result.station_id,
                reading_id=db_reading.id,
                sensor_id=sensor.id,
                anomaly_score=result.anomaly_score,
                is_anomaly=True,
                anomaly_type=result.anomaly_type,
                severity=result.severity,
                confidence=result.confidence,
                reason=result.reason,
                recommendation=result.recommendation
            )

            db.add(db_anomaly)
            db.flush()

    update_sensor_health(db, reading.station_id)

    db.commit()

    data = {
        "reading": reading.model_dump(),
        "analysis": result.model_dump()
    }

    await manager.broadcast(data)

    return result

