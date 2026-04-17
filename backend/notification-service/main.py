"""
SAMM Notification Service — Entry Point
Microservicio encargado de:
  1. Guardar los Expo Push Tokens de los usuarios
  2. Enviar push notifications (via Expo Push Service)
  3. Ser invocado por otros microservicios (medicamentos, citas, etc.)
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.infrastructure.database import engine, Base, aplicar_migraciones
from src.api.notification_router import router as notification_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SAMM Notification Service",
    description="Microservicio de push notifications para SAMM",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notification_router)


@app.on_event("startup")
def startup():
    logger.info("[Startup] Aplicando migraciones SQL...")
    aplicar_migraciones()
    logger.info("[Startup] Creando tablas si no existen...")
    Base.metadata.create_all(bind=engine)
    logger.info("[Startup] SAMM Notification Service listo en puerto 8002")


@app.get("/")
def health_check():
    return {"status": "ok", "servicio": "SAMM Notification Service"}
