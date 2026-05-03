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
    """Asegura que la BD exista y aplica migraciones de esquema."""
    try:
        _asegurar_bd_existe("samm_notifications_db")
    except Exception as exc:
        logger.error(f"[Migraciones] No se pudo asegurar la BD: {exc}")
        return

    # Migración: múltiples tokens por usuario.
    # Mueve la constraint UNIQUE de Id_Usuario a Push_Token.
    sql_migracion = """
    DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Push_Tokens') THEN
            -- Quitar UNIQUE de Id_Usuario si existe
            IF EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'Push_Tokens_Id_Usuario_key'
            ) THEN
                ALTER TABLE "Push_Tokens" DROP CONSTRAINT "Push_Tokens_Id_Usuario_key";
            END IF;

            -- Añadir UNIQUE a Push_Token si no existe
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'Push_Tokens_Push_Token_key'
            ) THEN
                ALTER TABLE "Push_Tokens" ADD CONSTRAINT "Push_Tokens_Push_Token_key" UNIQUE ("Push_Token");
            END IF;
        END IF;
    END$$;
    """
    try:
        with engine.connect() as conn:
            with conn.begin():
                conn.exec_driver_sql(sql_migracion)
        logger.info("[Migraciones] Constraint de Push_Tokens actualizada")
    except Exception as exc:
        logger.warning(f"[Migraciones] No se pudo migrar Push_Tokens: {exc}")

    sql_supervision = """
    CREATE TABLE IF NOT EXISTS "Supervision_Config" (
        "Id_Config" SERIAL PRIMARY KEY,
        "Id_Familiar" INTEGER NOT NULL UNIQUE,
        "Frecuencia_Minutos" INTEGER NOT NULL DEFAULT 15,
        "Tiempo_Max_Sin_Reporte_Minutos" INTEGER NOT NULL DEFAULT 60,
        "Fecha_Actualizacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    try:
        with engine.connect() as conn:
            with conn.begin():
                conn.exec_driver_sql(sql_supervision)
        logger.info("[Migraciones] Tabla Supervision_Config verificada")
    except Exception as exc:
        logger.warning(f"[Migraciones] No se pudo crear Supervision_Config: {exc}")


def obtener_sesion():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
