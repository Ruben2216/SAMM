"""
SAMM Identity Service — Entry Point
Servidor FastAPI para autenticación y gestión de identidad.
"""
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.infrastructure.persistence.database import engine, Base, aplicar_migraciones_desde_init_db
from src.infrastructure.api.auth_router import router as auth_router
from src.infrastructure.api.profile_router import router as profile_router
from src.infrastructure.api.vinculacion_router import router as vinculacion_router
from src.infrastructure.api.device_router import router as device_router

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
app.include_router(profile_router)
app.include_router(vinculacion_router)
app.include_router(device_router)


def _configurar_static_media() -> None:
    directorio_media = os.getenv("SAMM_MEDIA_DIR", "uploads")
    os.makedirs(directorio_media, exist_ok=True)
    os.makedirs(os.path.join(directorio_media, "avatars"), exist_ok=True)
    app.mount("/media", StaticFiles(directory=directorio_media), name="media")


@app.on_event("startup")
def startup():
    """Al iniciar el servidor, crea las tablas en PostgreSQL si no existen."""
    logger.info("[Startup] Aplicando migraciones SQL desde init_db.sql...")
    #aplicar_migraciones_desde_init_db()
    logger.info("[Startup] Creando tablas en PostgreSQL si no existen...")
    Base.metadata.create_all(bind=engine)
    logger.info("[Startup] Tablas verificadas/creadas exitosamente")
    _configurar_static_media()
    logger.info("[Startup] SAMM Identity Service listo")


@app.get("/")
def health_check():
    """Health check del servicio."""
    return {"status": "ok", "servicio": "SAMM Identity Service"}
