"""
Puerto: Servicio de Email
Interfaz abstracta para el envío de correos (recuperación de contraseña).
"""
from abc import ABC, abstractmethod


class EmailServicePort(ABC):
    """Puerto de salida para envío de emails."""

    @abstractmethod
    async def enviar_correo_recuperacion(self, correo: str, enlace: str) -> None:
        """Envía un correo de recuperación con un enlace profundo."""
        ...
