"""
Configuración de la Base de Datos — PostgreSQL con SQLAlchemy
"""
import os
import logging
from pathlib import Path

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger(__name__)

# Carga explícita del .env del servicio (no depende del directorio actual)
RUTA_ENV = Path(__file__).resolve().parents[3] / '.env'
if RUTA_ENV.exists():
    load_dotenv(dotenv_path=RUTA_ENV, override=False)
    logger.info('[Database] Variables cargadas desde .env del servicio')
else:
    # Fallback: permite que se use DATABASE_URL desde variables de entorno
    load_dotenv(override=False)

# URL de conexión a PostgreSQL (del docker-compose o variable de entorno)
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    DATABASE_URL = 'postgresql://postgres:1234@localhost:5432/samm_db'
    logger.warning('[Database] DATABASE_URL no encontrada; usando valor por defecto de desarrollo')

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
