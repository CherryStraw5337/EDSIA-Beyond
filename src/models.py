from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, Float, Integer
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class LecturaPanel(Base):
    __tablename__ = "lecturas_panel"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(UTC))
    voltaje = Column(Float, nullable=False)
    corriente = Column(Float, nullable=False)
    potencia = Column(Float, nullable=False)
    energia_acumulada = Column(Float, nullable=False)
    punto_id = Column(Integer, nullable=False, index=True)