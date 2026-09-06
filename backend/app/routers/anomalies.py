from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database.database import get_db
from backend.app.models import models


router = APIRouter(
    prefix="/anomalies",
    tags=["Anomalies"]
)

@router.get("")
def get_anomalies(db: Session = Depends(get_db)):
    anomalies = db.query(models.Anomaly).all()
    
    return anomalies

@router.get("/{anomalies_id}")
def get_anomaly(anomalies_id: int, db: Session = Depends(get_db)):
    anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == anomalies_id).first()
    
    return anomaly