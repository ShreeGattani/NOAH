from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.database import get_db
from backend.app.models import models

router = APIRouter(
    prefix="/stations",
    tags=["Stations"]
)

@router.get("")
def get_stations(db: Session = Depends(get_db)):
    stations = db.query(models.Station).all()
         
    return stations

@router.get("/{station_id}")
def get_station(station_id: str, db: Session = Depends(get_db)):
    station = db.query(models.Station).filter(models.Station.station_id == station_id).first()
    
    if station is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Station not found")
    
    return station

@router.get("/{station_id}/readings")
def get_station_readings(station_id: str, hours: int = 24, db: Session = Depends(get_db)):
    cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(hours=hours)

    readings = (
        db.query(models.Reading)
        .filter(
            models.Reading.station_id == station_id,
            models.Reading.timestamp >= cutoff
        )
        .order_by(models.Reading.timestamp.desc())
        .all()
    )

    return readings


@router.get("/{station_id}/anomalies")
def get_station_anomalies(station_id: str, db: Session = Depends(get_db)):
    anomalies = db.query(models.Anomaly).filter(models.Anomaly.station_id == station_id).all()
         
    return anomalies