"""
Fábrica de dependencias.
Centraliza la construcción de los casos de uso inyectando
los repositorios y servicios concretos.
FastAPI llamará a estas funciones en cada request.
"""

import os
from sqlalchemy.orm import Session
from fastapi import Depends

from src.infrastructure.persistence.database import get_db
from src.infrastructure.persistence.repositories import (
    SQLAlchemyUbicacionRepository,
    SQLAlchemyConfiguracionRepository,
)
from src.infrastructure.messaging.rabbitmq_publisher import (
    RabbitMQEventPublisher,
    NoOpEventPublisher,
)
from src.application.tracking_service import TrackingUseCases

# Si la variable RABBITMQ_URL no está definida, usamos el NoOp publisher
USE_RABBITMQ = bool(os.getenv("RABBITMQ_URL"))


def get_tracking_use_cases(db: Session = Depends(get_db)) -> TrackingUseCases:
    ubicacion_repo = SQLAlchemyUbicacionRepository(db)
    config_repo    = SQLAlchemyConfiguracionRepository(db)
    publisher      = RabbitMQEventPublisher() if USE_RABBITMQ else NoOpEventPublisher()

    return TrackingUseCases(
        ubicacion_repo   = ubicacion_repo,
        config_repo      = config_repo,
        event_publisher  = publisher,
    )