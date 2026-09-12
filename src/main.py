from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(
    title="Solaris Monitoring", 
    description="API para monitoreo de métricas de paneles solares",
    version="0.1.0"
)

# Esquema Pydantic para validar los datos que envía el sensor_simulado.py
class LecturaPayload(BaseModel):
    timestamp: datetime
    voltaje: float
    corriente: float
    potencia: float
    energia_acumulada: float
    punto_id: int

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API EDSIA Beyond corriendo"}

@app.post("/api/v1/lecturas")
def recibir_lectura(lectura: LecturaPayload):
    # TODO: Integrar inserción a la base de datos PostgreSQL con SQLAlchemy
    return {"message": "Lectura recibida exitosamente", "data": lectura}