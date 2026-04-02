from fastapi import FastAPI
from dotenv import load_dotenv
import os

from src.api.medication_router import router as medicamentos_router
from src.application.scheduler import iniciar_scheduler # <--- NUEVA IMPORTACIÓN

load_dotenv()

app = FastAPI(title="SAMM - Medication Service", version="1.0.0")

app.include_router(medicamentos_router)

# ESTO ENCIENDE EL CEREBRO DE ALERTAS CUANDO EL SERVICIO ARRANCA
@app.on_event("startup")
def startup_event():
    iniciar_scheduler()

@app.get("/")
def read_root():
    return {
        "status": "ok", 
        "servicio": "SAMM Medication Service",
        "mensaje": "¡El microservicio está vivo!"
    }