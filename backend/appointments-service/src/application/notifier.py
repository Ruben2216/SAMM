"""
Cliente HTTP para el notification-service.
Permite al medication-service notificar a los familiares vinculados
cuando el adulto mayor toma o se olvida de un medicamento.
"""
import os
import logging
import requests

logger = logging.getLogger(__name__)

NOTIFICATION_SERVICE_URL = os.getenv(
    "NOTIFICATION_SERVICE_URL",
    "http://192.168.1.7:8002"
)


def notificar_familiares(
    id_adulto_mayor: int,
    titulo: str,
    cuerpo: str,
    datos: dict | None = None,
) -> None:
    """
    Pide al notification-service que envíe push a los familiares del adulto.
    No-op si el notification-service no está disponible (no bloquea la API).
    """
    try:
        payload = {
            "id_usuario": id_adulto_mayor,
            "titulo": titulo,
            "cuerpo": cuerpo,
            "datos": datos or {},
        }
        respuesta = requests.post(
            f"{NOTIFICATION_SERVICE_URL}/notificar/familiares",
            json=payload,
            timeout=5,
        )
        logger.info(f"[Notifier] Push solicitado para adulto {id_adulto_mayor}. Status: {respuesta.status_code}")
    except Exception as e:
        logger.error(f"[Notifier] No se pudo contactar al notification-service: {e}")
