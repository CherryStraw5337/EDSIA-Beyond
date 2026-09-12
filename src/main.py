from datetime import datetime

from database import engine, get_db
from fastapi import Depends, FastAPI
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models

# Crear las tablas en la base de datos
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Solaris Monitoring")

crear_lectura_db = Depends(get_db)

# Esquema Pydantic para validar los datos de entrada
class LecturaCreate(BaseModel):
    timestamp: datetime
    voltaje: float
    corriente: float
    potencia: float
    energia_acumulada: float
    punto_id: str

@app.post("/api/v1/lecturas", status_code=201)
def crear_lectura(lectura: LecturaCreate, db: Session = crear_lectura_db):
    db_lectura = models.LecturaPanel(**lectura.model_dump())
    db.add(db_lectura)
    db.commit()
    db.refresh(db_lectura)
    return db_lectura