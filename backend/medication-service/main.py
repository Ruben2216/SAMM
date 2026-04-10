from fastapi import FastAPI
from dotenv import load_dotenv
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

# ESTO ENCIENDE EL CEREBRO DE ALERTAS CUANDO EL SERVICIO ARRANCA
@app.on_event("startup")
def startup_event():
    # Crear tablas nuevas si no existen (no toca las existentes)
    Base.metadata.create_all(bind=engine)
    iniciar_scheduler()

@app.get("/")
def read_root():
    return {
        "status": "ok", 
        "servicio": "SAMM Medication Service",
        "mensaje": "¡El microservicio está vivo!"
    }