from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timezone

Base = declarative_base()

class LecturaPanel(Base):
    __tablename__ = "lecturas_panel"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    voltaje = Column(Float)
    corriente = Column(Float)
    potencia = Column(Float)
    energia_acumulada = Column(Float)
    punto_id = Column(String, index=True)