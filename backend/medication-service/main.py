from fastapi import FastAPI
from dotenv import load_dotenv
import os

from src.api.medication_router import router as medicamentos_router

load_dotenv()

app = FastAPI(title="SAMM - Medication Service", version="1.0.0")

app.include_router(medicamentos_router)

@app.get("/")
def read_root():
    return {
        "status": "ok", 
        "servicio": "SAMM Medication Service",
        "mensaje": "¡El microservicio de Fernando está vivo!"
    }