"""
SAMM Identity Service — Entry Point
Servidor FastAPI para autenticación y gestión de identidad.
"""
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.infrastructure.persistence.database import engine, Base
from src.infrastructure.api.auth_router import router as auth_router

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Crear la aplicación FastAPI
app = FastAPI(
    title="SAMM Identity Service",
    description="Servicio de autenticación y gestión de identidad para SAMM",
    version="1.0.0",
)

# CORS — permitir requests del frontend (React Native / Expo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, restringir a dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir router de autenticación
app.include_router(auth_router)


@app.on_event("startup")
def startup():
    """Al iniciar el servidor, crea las tablas en PostgreSQL si no existen."""
    logger.info("[Startup] Creando tablas en PostgreSQL si no existen...")
    Base.metadata.create_all(bind=engine)
    logger.info("[Startup] Tablas verificadas/creadas exitosamente")
    logger.info("[Startup] SAMM Identity Service listo")


@app.get("/")
def health_check():
    """Health check del servicio."""
    return {"status": "ok", "servicio": "SAMM Identity Service"}
