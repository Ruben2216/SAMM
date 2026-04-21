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

    @abstractmethod
    def crear_token_recuperacion(self, id_usuario: int, pwd_frag: str) -> str:
        """Genera un JWT de recuperación de contraseña (expira en 10 minutos)."""
        ...

    @abstractmethod
    def verificar_token_recuperacion(self, token: str) -> dict:
        """Verifica y decodifica un JWT de recuperación. Retorna el payload."""
        ...
