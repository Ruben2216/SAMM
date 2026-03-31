"""
Puerto: Hasher de Contraseñas
Interfaz abstracta para el hashing y verificación de contraseñas.
"""
from abc import ABC, abstractmethod


class PasswordHasherPort(ABC):
    """Puerto de salida para hashing de contraseñas."""

    @abstractmethod
    def hashear(self, contrasena: str) -> str:
        """Genera un hash seguro de la contraseña."""
        ...

    @abstractmethod
    def verificar(self, contrasena_plana: str, contrasena_hash: str) -> bool:
        """Verifica si una contraseña plana coincide con su hash."""
        ...
