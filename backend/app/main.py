from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from backend.app.database.database import Base, engine
from backend.app.models import models

from backend.app.routers import (
    readings,
    stations,
    anomalies
)


Base.metadata.create_all(bind=engine)

app = FastAPI()


app.include_router(readings.router)
app.include_router(stations.router)
app.include_router(anomalies.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


