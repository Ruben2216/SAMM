"""
Puerto: Autenticación de Google
Interfaz abstracta para la verificación de tokens de Google.
"""
from abc import ABC, abstractmethod

from src.domain.models.user import InfoUsuarioGoogle


class GoogleAuthPort(ABC):
    """Puerto de salida para verificación de id_token de Google."""

    @abstractmethod
    def verificar_id_token(self, id_token: str) -> InfoUsuarioGoogle:
        """
        Verifica un id_token de Google contra los servidores de Google.
        Retorna la información del usuario extraída del token.
        Lanza excepción si el token es inválido.
        """
        ...
