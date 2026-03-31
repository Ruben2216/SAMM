"""
Configuración de la Base de Datos — PostgreSQL con SQLAlchemy
"""
import os
import logging

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger(__name__)

# URL de conexión a PostgreSQL (del docker-compose o variable de entorno)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://SAMM:samm@localhost:5432/samm_db"
)

logger.info(f"[Database] Conectando a PostgreSQL...")

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def obtener_sesion():
    """Generador de sesiones de base de datos para inyección de dependencias."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
