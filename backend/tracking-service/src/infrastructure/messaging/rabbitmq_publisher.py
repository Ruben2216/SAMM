"""
Adaptador de mensajería: publica eventos de ubicación en RabbitMQ.
Cuando el adulto mayor envía su posición, este adaptador notifica
al servicio de notificaciones / familiar.
"""

import json
import logging
import os
import pika
from datetime import datetime, timezone

from src.domain.ports.repositories import IEventPublisher

logger = logging.getLogger(__name__)

RABBITMQ_URL   = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
EXCHANGE_NAME  = "samm.tracking"
ROUTING_KEY    = "ubicacion.nueva"


class RabbitMQEventPublisher(IEventPublisher):
    """
    Implementación real de IEventPublisher usando pika (RabbitMQ).
    Publica un mensaje JSON cada vez que llega una nueva ubicación.
    El notification-service / familiar-service consumirá esta cola.
    """

    def publicar_ubicacion(self, id_adulto_mayor: int, latitud: float, longitud: float) -> None:
        mensaje = {
            "evento":          "NUEVA_UBICACION",
            "id_adulto_mayor": id_adulto_mayor,
            "latitud":         latitud,
            "longitud":        longitud,
            "timestamp":       datetime.now(timezone.utc).isoformat(),
        }

        try:
            parametros  = pika.URLParameters(RABBITMQ_URL)
            conexion    = pika.BlockingConnection(parametros)
            canal       = conexion.channel()

            canal.exchange_declare(
                exchange      = EXCHANGE_NAME,
                exchange_type = "topic",
                durable       = True,
            )

            canal.basic_publish(
                exchange     = EXCHANGE_NAME,
                routing_key  = ROUTING_KEY,
                body         = json.dumps(mensaje),
                properties   = pika.BasicProperties(
                    delivery_mode = 2,  # Mensaje persistente
                    content_type  = "application/json",
                ),
            )
            conexion.close()
            logger.info(f"Evento publicado en RabbitMQ para adulto mayor {id_adulto_mayor}.")

        except Exception as e:
            logger.error(f"Error publicando en RabbitMQ: {e}")
            raise


class NoOpEventPublisher(IEventPublisher):
    """
    Implementación vacía para entornos de desarrollo / testing
    donde no hay RabbitMQ disponible.
    """
    def publicar_ubicacion(self, id_adulto_mayor: int, latitud: float, longitud: float) -> None:
        logger.info(
            f"[NoOp] Ubicación recibida para adulto mayor {id_adulto_mayor}: "
            f"({latitud}, {longitud}). (RabbitMQ deshabilitado)"
        )
