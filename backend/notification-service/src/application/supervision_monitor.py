import logging
import os
import threading
import time
from datetime import datetime, timedelta, timezone

import requests
from sqlalchemy.orm import Session

from src.application.push_service import enviar_push_a_tokens
from src.domain.models import PushTokenModel, SupervisionConfigModel
from src.infrastructure.database import SessionLocal

logger = logging.getLogger(__name__)

TRACKING_SERVICE_URL = os.getenv("TRACKING_SERVICE_URL", "http://localhost:8006")
INTERVALO_MONITOR_SEGUNDOS = 60

_estado_envios: dict[tuple[int, int], dict[str, datetime]] = {}
_bloqueo_estado = threading.Lock()


def _parsear_fecha_utc(fecha_iso: str | None) -> datetime | None:
    if not fecha_iso:
        return None

    try:
        fecha = datetime.fromisoformat(fecha_iso.replace("Z", "+00:00"))
        if fecha.tzinfo is None:
            return fecha.replace(tzinfo=timezone.utc)
        return fecha.astimezone(timezone.utc)
    except Exception:
        return None


def _obtener_tokens_familiar(db: Session, id_familiar: int) -> list[str]:
    registros = db.query(PushTokenModel).filter_by(Id_Usuario=id_familiar).all()
    return [registro.Push_Token for registro in registros if registro.Push_Token]


def _obtener_mapa_familiar(id_familiar: int) -> list[dict]:
    url = f"{TRACKING_SERVICE_URL}/rastreo/familiar/{id_familiar}/mapa"
    try:
        respuesta = requests.get(url, timeout=8)
        if not respuesta.ok:
            logger.warning(
                "[MonitorSupervision] tracking-service respondio %s para familiar %s",
                respuesta.status_code,
                id_familiar,
            )
            return []
        data = respuesta.json() or {}
        return data.get("adultos_mayores", [])
    except Exception as error:
        logger.warning(
            "[MonitorSupervision] No se pudo consultar mapa del familiar %s: %s",
            id_familiar,
            error,
        )
        return []


def _enviar_alerta_actualizacion(tokens: list[str], id_familiar: int, id_adulto: int) -> None:
    enviar_push_a_tokens(
        tokens=tokens,
        titulo="Actualización de rastreo",
        cuerpo="Tu adulto mayor compartió una nueva ubicación.",
        datos={
            "tipo": "alerta_familiar",
            "tipoAlerta": "actualizacion_rastreo",
            "targetUserId": id_familiar,
            "id_adulto": id_adulto,
        },
        channel_id="alertas_familiar",
    )


def _enviar_alerta_sin_reporte(tokens: list[str], id_familiar: int, id_adulto: int) -> None:
    enviar_push_a_tokens(
        tokens=tokens,
        titulo="Sin reporte de ubicación",
        cuerpo="Tu adulto mayor superó el tiempo máximo sin enviar ubicación.",
        datos={
            "tipo": "alerta_familiar",
            "tipoAlerta": "sin_reporte",
            "targetUserId": id_familiar,
            "id_adulto": id_adulto,
        },
        channel_id="alertas_familiar",
    )


def _procesar_familiar(db: Session, config: SupervisionConfigModel, ahora: datetime) -> None:
    id_familiar = config.Id_Familiar
    frecuencia = max(1, int(config.Frecuencia_Minutos or 15))
    tiempo_max = max(1, int(config.Tiempo_Max_Sin_Reporte_Minutos or 60))

    tokens = _obtener_tokens_familiar(db, id_familiar)
    if not tokens:
        return

    adultos = _obtener_mapa_familiar(id_familiar)
    if not adultos:
        return

    for adulto in adultos:
        if not adulto.get("Activo", False):
            continue

        ultima = adulto.get("ultima_ubicacion") or {}
        fecha_ubicacion = _parsear_fecha_utc(ultima.get("Fecha_Hora"))
        id_adulto = int(adulto.get("Id_Adulto_Mayor"))

        if not fecha_ubicacion:
            continue

        clave = (id_familiar, id_adulto)
        with _bloqueo_estado:
            estado = _estado_envios.setdefault(clave, {})

        ultima_ubicacion_notificada = estado.get("ultima_ubicacion_notificada")
        ultima_alerta_sin_reporte = estado.get("ultima_alerta_sin_reporte")

        cambio_ubicacion = (
            ultima_ubicacion_notificada is None
            or fecha_ubicacion > ultima_ubicacion_notificada
        )

        if cambio_ubicacion:
            ultima_notificacion = estado.get("ultima_notificacion_ubicacion")
            if ultima_notificacion is None or (ahora - ultima_notificacion) >= timedelta(minutes=frecuencia):
                _enviar_alerta_actualizacion(tokens, id_familiar, id_adulto)
                with _bloqueo_estado:
                    estado["ultima_notificacion_ubicacion"] = ahora
                    estado["ultima_ubicacion_notificada"] = fecha_ubicacion
                    estado.pop("ultima_ubicacion_alertada_sin_reporte", None)

        if (ahora - fecha_ubicacion) >= timedelta(minutes=tiempo_max):
            ubicacion_alertada = estado.get("ultima_ubicacion_alertada_sin_reporte")
            debe_alertar = ubicacion_alertada is None or fecha_ubicacion > ubicacion_alertada
            if debe_alertar and (
                ultima_alerta_sin_reporte is None
                or (ahora - ultima_alerta_sin_reporte) >= timedelta(minutes=tiempo_max)
            ):
                _enviar_alerta_sin_reporte(tokens, id_familiar, id_adulto)
                with _bloqueo_estado:
                    estado["ultima_alerta_sin_reporte"] = ahora
                    estado["ultima_ubicacion_alertada_sin_reporte"] = fecha_ubicacion


def ejecutar_monitor_supervision() -> None:
    logger.info("[MonitorSupervision] Iniciando monitor automatico de supervision")
    while True:
        ahora = datetime.now(timezone.utc)
        db = SessionLocal()
        try:
            configuraciones = db.query(SupervisionConfigModel).all()
            for config in configuraciones:
                _procesar_familiar(db, config, ahora)
        except Exception as error:
            logger.error("[MonitorSupervision] Error en ciclo de supervision: %s", error)
        finally:
            db.close()

        time.sleep(INTERVALO_MONITOR_SEGUNDOS)


def iniciar_monitor_supervision() -> None:
    hilo = threading.Thread(target=ejecutar_monitor_supervision, daemon=True)
    hilo.start()
