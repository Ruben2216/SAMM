from fastapi import FastAPI
from dotenv import load_dotenv
from sqlalchemy import text
import os

from src.api.medication_router import router as medicamentos_router
from src.api.perfil_salud_router import router as perfil_salud_router
from src.application.scheduler import iniciar_scheduler
from src.infrastructure.database import engine, Base
from src.domain import models  # Importar para que SQLAlchemy conozca todos los modelos

load_dotenv()

app = FastAPI(title="SAMM - Medication Service", version="1.0.0")

app.include_router(medicamentos_router)
app.include_router(perfil_salud_router)


def _migraciones_ligeras():
    """Agrega columnas nuevas a tablas existentes sin romper datos. PostgreSQL."""
    with engine.begin() as conn:
        conn.execute(text(
            'ALTER TABLE "Horarios" '
            'ADD COLUMN IF NOT EXISTS "Dias_Semana" VARCHAR(20) NOT NULL DEFAULT \'1,2,3,4,5,6,7\''
        ))


# ESTO ENCIENDE EL CEREBRO DE ALERTAS CUANDO EL SERVICIO ARRANCA
@app.on_event("startup")
def startup_event():
    # Crear tablas nuevas si no existen (no toca las existentes)
    Base.metadata.create_all(bind=engine)
    _migraciones_ligeras()
    iniciar_scheduler()

@app.get("/")
def read_root():
    return {
        "status": "ok", 
        "servicio": "SAMM Medication Service",
        "mensaje": "¡El microservicio está vivo!"
    }