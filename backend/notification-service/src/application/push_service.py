
"""
Lógica de envío de Push Notifications via Expo Push Service.
"""
import os
import logging
import requests

logger = logging.getLogger(__name__)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
IDENTITY_SERVICE_URL = os.getenv("IDENTITY_SERVICE_URL", "http://localhost:8000")


def enviar_push_a_tokens(
    tokens: list[str],
    titulo: str,
    cuerpo: str,
    datos: dict | None = None,
    channel_id: str = "alertas_familiar",
) -> dict:
    """
    Envía push notifications a una lista de Expo Push Tokens.
    - channel_id: canal Android a usar. "medicamentos_alarma_v2" = alarma fuerte (adulto mayor),
      "alertas_familiar" = push informativo normal (familiar).
    Retorna el resultado de Expo Push Service.
    """
    if not tokens:
        logger.info("[Push] Sin tokens para enviar")
        return {"status": "no_tokens", "enviados": 0}

    mensajes = [
        {
            "to": token,
            "title": titulo,
            "body": cuerpo,
            "sound": "default",
            "priority": "high",
            "channelId": channel_id,
            "data": datos or {},
        }
        for token in tokens
    ]

    try:
        respuesta = requests.post(
            EXPO_PUSH_URL,
            json=mensajes,
            headers={
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            timeout=10,
        )
        cuerpo = respuesta.json()
        logger.info(f"[Push] Enviado a {len(tokens)} token(s). HTTP {respuesta.status_code}. Respuesta: {cuerpo}")

        # Inspecciona tickets: Expo devuelve status 'ok' o 'error' por cada token
        tickets = cuerpo.get("data", []) if isinstance(cuerpo, dict) else []
        for i, ticket in enumerate(tickets):
            if isinstance(ticket, dict) and ticket.get("status") == "error":
                token_fallido = tokens[i] if i < len(tokens) else "?"
                logger.error(
                    f"[Push] Token falló ({ticket.get('details', {}).get('error', 'UnknownError')}): "
                    f"{token_fallido} — {ticket.get('message')}"
                )

        return {"status": "ok", "enviados": len(tokens), "respuesta": cuerpo}
    except Exception as e:
        logger.error(f"[Push] Error enviando push: {e}")
        return {"status": "error", "error": str(e)}


def obtener_nombre_usuario(id_usuario: int) -> str | None:
    """Consulta el nombre del usuario al identity-service."""
    try:
        url = f"{IDENTITY_SERVICE_URL}/users/internal/nombre/{id_usuario}"
        respuesta = requests.get(url, timeout=5)
        if respuesta.status_code == 200:
            return respuesta.json().get("nombre")
        return None
    except Exception as e:
        logger.error(f"[Nombre] Error consultando identity: {e}")
        return None


def obtener_vinculados(id_usuario: int) -> dict:
    """
    Consulta al identity-service para obtener los IDs vinculados.
    Retorna: {familiares_ids, adultos_ids, rol_adulto_mayor}
    """
    try:
        url = f"{IDENTITY_SERVICE_URL}/users/internal/vinculados/{id_usuario}"
        respuesta = requests.get(url, timeout=5)
        if respuesta.status_code == 200:
            return respuesta.json()
        logger.warning(f"[Vinculados] Identity respondió {respuesta.status_code}")
        return {"familiares_ids": [], "adultos_ids": [], "rol_adulto_mayor": None}
    except Exception as e:
        logger.error(f"[Vinculados] Error consultando identity: {e}")
        return {"familiares_ids": [], "adultos_ids": [], "rol_adulto_mayor": None}
