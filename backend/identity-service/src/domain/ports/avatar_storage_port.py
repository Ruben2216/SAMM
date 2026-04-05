"""Puerto: Storage de Avatares

Define cómo la aplicación guarda/elimina un avatar sin acoplarse a una tecnología.
"""

from abc import ABC, abstractmethod


class AvatarStoragePort(ABC):
    """Puerto de salida para guardar/eliminar avatares."""

    @abstractmethod
    def guardar_avatar(self, id_usuario: int, contenido: bytes, extension: str) -> str:
        """Guarda el avatar y retorna la ruta pública (relativa o absoluta)."""
        ...

    @abstractmethod
    def eliminar_avatar(self, id_usuario: int) -> None:
        """Elimina el avatar del usuario si existe."""
        ...
