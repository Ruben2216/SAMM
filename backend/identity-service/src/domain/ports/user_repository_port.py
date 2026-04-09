"""
Puerto: Repositorio de Usuarios
Interfaz abstracta que define cómo la capa de dominio accede a la persistencia.
"""
from abc import ABC, abstractmethod
from typing import Optional

from src.domain.models.user import Usuario


class UserRepositoryPort(ABC):
    """Puerto de salida para persistencia de usuarios."""

    @abstractmethod
    def buscar_por_correo(self, correo: str) -> Optional[Usuario]:
        """Busca un usuario por su correo electrónico."""
        ...

    @abstractmethod
    def buscar_por_google_id(self, google_id: str) -> Optional[Usuario]:
        """Busca un usuario por su ID de Google."""
        ...

    @abstractmethod
    def buscar_por_id(self, id_usuario: int) -> Optional[Usuario]:
        """Busca un usuario por su ID autoincremental."""
        ...

    @abstractmethod
    def buscar_por_codigo_vinculacion(self, codigo: str) -> Optional[Usuario]:
        """Busca un familiar por su código de vinculación."""
        ...

    @abstractmethod
    def guardar(self, usuario: Usuario) -> Usuario:
        """Persiste un nuevo usuario y retorna la entidad con Id asignado."""
        ...

    @abstractmethod
    def actualizar(self, usuario: Usuario) -> Usuario:
        """Actualiza un usuario existente."""
        ...
