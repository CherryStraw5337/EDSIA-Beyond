from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class LecturaPanel(Base):
    __tablename__ = "lecturas_panel"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(UTC))
    voltaje = Column(Float)
    corriente = Column(Float)
    potencia = Column(Float)
    energia_acumulada = Column(Float)
    punto_id = Column(String, index=True)