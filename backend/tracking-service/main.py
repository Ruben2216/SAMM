
from fastapi import FastAPI
from dotenv import load_dotenv

from src.infrastructure.api.tracking_router import router as tracking_router
from src.infrastructure.persistence.database import engine, Base
from src.domain.models import tracking_models  # noqa: F401 — registra los modelos en Base

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title       = "SAMM - Tracking Service",
    version     = "1.0.0",
    description = (
        "Microservicio de rastreo GPS para el adulto mayor. "
        "Permite al adulto mayor activar su ubicación en segundo plano "
        "y al familiar configurar la frecuencia de actualización y ver el mapa."
    ),
)

app.include_router(tracking_router)


@app.get("/")
def read_root():
    return {
        "status":   "ok",
        "servicio": "SAMM Tracking Service",
        "mensaje":  "¡El microservicio de rastreo está activo!",
        "puerto":   8006,
    }