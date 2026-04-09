from abc import ABC, abstractmethod
from typing import Optional, List

from src.domain.models.vinculacion import Vinculacion


class VinculacionRepositoryPort(ABC):
    """Puerto de salida para persistencia de vinculaciones."""

    @abstractmethod
    def guardar(self, vinculacion: Vinculacion) -> Vinculacion:
        """Persiste una nueva vinculación."""
        ...

    @abstractmethod
    def buscar_por_familiar(self, id_familiar: int) -> List[Vinculacion]:
        """Busca todas las vinculaciones de un familiar."""
        ...

    @abstractmethod
    def buscar_por_adulto_mayor(self, id_adulto_mayor: int) -> List[Vinculacion]:
        """Busca todas las vinculaciones de un adulto mayor."""
        ...

    @abstractmethod
    def existe_vinculacion(self, id_familiar: int, id_adulto_mayor: int) -> bool:
        """Verifica si ya existe una vinculación entre ambos usuarios."""
        ...

    @abstractmethod
    def buscar_por_id(self, id_vinculacion: int) -> Optional[Vinculacion]:
        """Busca una vinculación por su ID."""
        ...

    @abstractmethod
    def actualizar(self, vinculacion: Vinculacion) -> Vinculacion:
        """Actualiza una vinculación existente."""
        ...
