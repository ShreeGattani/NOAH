from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database.database import get_db
from backend.app.models import models


router = APIRouter(
    prefix="/anomalies",
    tags=["Anomalies"]
)

@router.get("/anomalies")
def get_anomalies(db: Session = Depends(get_db)):
    anomalies = db.query(models.Anomaly).all()
    
    return anomalies