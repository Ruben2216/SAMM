"""
Configuración de la Base de Datos — PostgreSQL con SQLAlchemy
"""
import os
import logging
from pathlib import Path

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.engine.url import make_url
from sqlalchemy.exc import SQLAlchemyError
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


def _es_nombre_bd_seguro(nombre_bd: str) -> bool:
    """Valida un nombre de BD básico para evitar inyección."""
    if not nombre_bd:
        return False
    permitido = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_")
    return all(c in permitido for c in nombre_bd)


def _asegurar_bd_existe(nombre_bd: str) -> None:
    """Crea la base de datos si no existe.

    Requiere que el usuario de DATABASE_URL tenga privilegio CREATEDB.
    """
    if not _es_nombre_bd_seguro(nombre_bd):
        raise ValueError("Nombre de BD inválido")

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


def _separar_sentencias_sql(texto: str) -> list[str]:
    """Separa un script SQL en sentencias por ';' respetando bloques DO $$...$$."""
    # Remover comentarios de línea completos
    lineas = []
    for linea in texto.splitlines():
        if linea.strip().startswith("--"):
            continue
        lineas.append(linea)
    texto = "\n".join(lineas)

    sentencias: list[str] = []
    buffer: list[str] = []
    dentro_comilla_simple = False
    dentro_dolar = False
    i = 0

    while i < len(texto):
        if not dentro_comilla_simple and texto[i : i + 2] == "$$":
            dentro_dolar = not dentro_dolar
            buffer.append("$$")
            i += 2
            continue

        ch = texto[i]

        if not dentro_dolar and ch == "'":
            # Manejar escape de comilla simple en SQL: ''
            if dentro_comilla_simple and i + 1 < len(texto) and texto[i + 1] == "'":
                buffer.append("''")
                i += 2
                continue
            dentro_comilla_simple = not dentro_comilla_simple
            buffer.append(ch)
            i += 1
            continue

        if not dentro_comilla_simple and not dentro_dolar and ch == ";":
            sentencia = "".join(buffer).strip()
            if sentencia:
                sentencias.append(sentencia)
            buffer = []
            i += 1
            continue

        buffer.append(ch)
        i += 1

    ultima = "".join(buffer).strip()
    if ultima:
        sentencias.append(ultima)
    return sentencias


def aplicar_migraciones_desde_init_db() -> None:
    """Ejecuta el init_db.sql como migraciones al arrancar el servicio.

    - Crea la BD si no existe.
    - Aplica ALTER/CREATE/INDEX de forma idempotente.
    """
    ruta_servicio = Path(__file__).resolve().parents[3]
    ruta_script = ruta_servicio / "init_db.sql"
    if not ruta_script.exists():
        logger.warning("[Migraciones] init_db.sql no encontrado; omitiendo")
        return

    # Asegurar BD destino
    try:
        _asegurar_bd_existe("samm_db")
    except Exception as exc:
        logger.error(f"[Migraciones] No se pudo asegurar la BD: {exc}")
        raise

    texto = ruta_script.read_text(encoding="utf-8")
    sentencias = _separar_sentencias_sql(texto)

    try:
        with engine.connect() as conn:
            # Evita ejecuciones simultáneas si se levantan varias instancias
            conn.exec_driver_sql("SELECT pg_advisory_lock(724197)")
            try:
                for sentencia in sentencias:
                    limpia = sentencia.strip()
                    if not limpia:
                        continue
                    upper = limpia.upper()
                    if upper.startswith("CREATE DATABASE"):
                        continue
                    if limpia.startswith("\\c") or upper.startswith("\\C"):
                        continue
                    conn.exec_driver_sql(limpia)
                conn.commit()
            except Exception:
                conn.rollback()
                raise
            finally:
                try:
                    conn.exec_driver_sql("SELECT pg_advisory_unlock(724197)")
                    conn.commit()
                except Exception:
                    conn.rollback()
                    logger.warning("[Migraciones] No se pudo liberar advisory lock", exc_info=True)
    except SQLAlchemyError as exc:
        logger.error(f"[Migraciones] Error aplicando init_db.sql: {exc}")
        raise


def obtener_sesion():
    """Generador de sesiones de base de datos para inyección de dependencias."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
