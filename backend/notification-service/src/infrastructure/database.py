"""
Configuración de la Base de Datos del Notification Service.
"""
import os
import logging
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger(__name__)

RUTA_ENV = Path(__file__).resolve().parents[2] / '.env'
if RUTA_ENV.exists():
    load_dotenv(dotenv_path=RUTA_ENV, override=False)
else:
    load_dotenv(override=False)

DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:1234@localhost:5432/samm_notifications_db'
)

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def _asegurar_bd_existe(nombre_bd: str) -> None:
    """Crea la BD si no existe."""
    url = make_url(DATABASE_URL)
    url_admin = url.set(database="postgres")

    engine_admin = create_engine(url_admin, echo=False, isolation_level="AUTOCOMMIT")
    try:
        with engine_admin.connect() as conn:
            existe = conn.exec_driver_sql(
                "SELECT 1 FROM pg_database WHERE datname = %s",
                (nombre_bd,),
            ).scalar()
            if existe:
                return
            conn.exec_driver_sql(f'CREATE DATABASE "{nombre_bd}"')
            logger.info(f"[Database] Base de datos creada: {nombre_bd}")
    finally:
        engine_admin.dispose()


def aplicar_migraciones() -> None:
    """Asegura que la BD exista. Las tablas las crea SQLAlchemy."""
    try:
        _asegurar_bd_existe("samm_notifications_db")
    except Exception as exc:
        logger.error(f"[Migraciones] No se pudo asegurar la BD: {exc}")


def obtener_sesion():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
