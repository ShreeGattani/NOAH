from datetime import datetime

from enum import Enum
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.app.database.database import Base

class SensorHealthStatus(str, Enum):
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    CRITICAL = "CRITICAL"

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)

    station_id = Column(String, unique=True, nullable=False, index=True)
    station_name = Column(String, nullable=False)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    altitude = Column(Float)
    
    sensors = relationship("Sensor", back_populates="station")
    readings = relationship("Reading", back_populates="station")
    anomalies = relationship("Anomaly", back_populates="station")


class Sensor(Base):
    __tablename__ = "sensors"
    
    __table_args__ = (
    UniqueConstraint(
        "station_id",
        "sensor_type",
        name="uq_station_sensor_type"
    ),
)

    id = Column(Integer, primary_key=True, index=True)

    station_id = Column(
        String,
        ForeignKey("stations.station_id"),
        nullable=False,
        index=True
    )

    sensor_type = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")

    station = relationship("Station", back_populates="sensors")
    health = relationship("SensorHealth", back_populates="sensor", uselist=False, cascade="all, delete-orphan")


class SensorHealth(Base):
    __tablename__ = "sensor_health"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id"), nullable=False, unique=True)

    status = Column(
        SQLEnum(SensorHealthStatus),
        nullable=False,
        default=SensorHealthStatus.HEALTHY
    )

    health_score = Column(Float, default=100.0)
    health_window_size = Column(Integer, default=100)
    normal_readings = Column(Integer, default=0)

    sensor = relationship("Sensor", back_populates="health")


class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True)

    timestamp = Column(DateTime, nullable=False, index=True)

    station_id = Column(
        String,
        ForeignKey("stations.station_id"),
        nullable=False,
        index=True
    )

    temperature = Column(Float)
    humidity = Column(Float)
    pressure = Column(Float)
    rainfall = Column(Float)
    wind_speed = Column(Float)
    
    station = relationship("Station", back_populates="readings")

class AnomalyClassification(str, Enum):
    WEATHER_EVENT = "WEATHER_EVENT"
    SENSOR_FAULT = "SENSOR_FAULT"

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)

    timestamp = Column(DateTime, nullable=False, index=True)

    station_id = Column(
        String,
        ForeignKey("stations.station_id"),
        nullable=False,
        index=True
    )
    
    reading_id = Column(
    Integer,
    ForeignKey("readings.id"),
    nullable=False,
    index=True
    )
    
    sensor_id = Column(
    Integer,
    ForeignKey("sensors.id"),
    nullable=True,
    index=True
    )

    anomaly_score = Column(Float, nullable=False)
    is_anomaly = Column(Boolean, nullable=False)

    anomaly_type = Column(String)
    severity = Column(String)
    confidence = Column(Float)
    
    classification = Column(SQLEnum(AnomalyClassification), nullable=True)
    classification_reason = Column(String)

    metric = Column(String)

    reason = Column(String)
    recommendation = Column(String)
    
    station = relationship("Station", back_populates="anomalies")