from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import models
from database import engine, get_db

# Crear las tablas en la base de datos
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EDSIA Beyond API")

# Esquema Pydantic para validar los datos de entrada
class LecturaCreate(BaseModel):
    timestamp: datetime
    voltaje: float
    corriente: float
    potencia: float
    energia_acumulada: float
    punto_id: str

@app.post("/api/v1/lecturas", status_code=201)
def crear_lectura(lectura: LecturaCreate, db: Session = Depends(get_db)):
    db_lectura = models.LecturaPanel(**lectura.model_dump())
    db.add(db_lectura)
    db.commit()
    db.refresh(db_lectura)
    return db_lectura