"""
Puerto: Servicio de Tokens JWT
Interfaz abstracta para la generación y verificación de tokens de sesión.
"""
from abc import ABC, abstractmethod
from typing import Optional


class TokenServicePort(ABC):
    """Puerto de salida para manejo de tokens JWT."""

    @abstractmethod
    def crear_token(self, id_usuario: int, rol: Optional[str]) -> str:
        """Genera un JWT de sesión para el usuario."""
        ...

    @abstractmethod
    def verificar_token(self, token: str) -> dict:
        """Verifica y decodifica un JWT. Retorna el payload."""
        ...
