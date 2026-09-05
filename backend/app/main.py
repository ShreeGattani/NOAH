from fastapi import Depends, FastAPI, WebSocket, status, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.services.processing import process_reading

app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/readings", response_model=schemas.AnomalyResult, status_code=status.HTTP_201_CREATED)
def post_readings(reading: schemas.WeatherReading, db: Session = Depends(get_db)):
    
    result = process_reading(reading)
    
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
    
    if result.is_anomaly:
        db_anomaly = models.Anomaly(
            timestamp=result.timestamp,
            station_id=result.station_id,
            anomaly_score=result.anomaly_score,
            is_anomaly=result.is_anomaly,
            anomaly_type=result.anomaly_type,
            severity=result.severity,
            confidence=result.confidence,
            reason=result.reason,
            recommendation=result.recommendation
        )
        
        db.add(db_anomaly)
    
    db.commit()
    
    return result


@app.get("/stations")
def get_stations(db: Session = Depends(get_db)):
    stations = db.query(models.Station).all()
         
    return stations

@app.get("/stations/{station_id}")
def get_station(station_id: str, db: Session = Depends(get_db)):
    station = db.query(models.Station).filter(models.Station.station_id == station_id).first()
    
    if station is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Station not found")
    
    return station

@app.get("/stations/{station_id}/readings")
def get_station_readings(station_id: str, db: Session = Depends(get_db)):
    readings = db.query(models.Reading).filter(models.Reading.station_id == station_id).all()
          
    return readings



@app.get("/stations/{station_id}/anomalies")
def get_station_anomalies(station_id: str, db: Session = Depends(get_db)):
    anomalies = db.query(models.Anomaly).filter(models.Anomaly.station_id == station_id).all()
         
    return anomalies

@app.get("/anomalies")
def get_anomalies(db: Session = Depends(get_db)):
    anomalies = db.query(models.Anomaly).all()
    
    return anomalies

@app.websocket("/ws")
async def websocket(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(data)

