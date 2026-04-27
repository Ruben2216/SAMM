"""
Puertos (Ports) — Interfaces que definen los contratos
entre el dominio y la infraestructura.

Siguiendo el patrón de Arquitectura Hexagonal (Ports & Adapters),
el dominio NO conoce los detalles de implementación;
solo conoce estas interfaces.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from src.domain.models.tracking_models import Ubicacion, ConfiguracionRastreo


class IUbicacionRepository(ABC):
    """Contrato para persistencia de ubicaciones."""

    @abstractmethod
    def guardar(self, ubicacion: Ubicacion) -> Ubicacion:
        ...

    @abstractmethod
    def obtener_ultimas_por_adulto(self, id_adulto_mayor: int) -> List[Ubicacion]:
        """Devuelve las últimas ubicaciones (máx. 4) de un adulto mayor."""
        ...

    @abstractmethod
    def obtener_ultima(self, id_adulto_mayor: int) -> Optional[Ubicacion]:
        """Devuelve la ubicación más reciente de un adulto mayor."""
        ...


class IConfiguracionRepository(ABC):
    """Contrato para persistencia de configuraciones de rastreo."""

    @abstractmethod
    def crear_o_actualizar(self, config: ConfiguracionRastreo) -> ConfiguracionRastreo:
        ...

    @abstractmethod
    def obtener_por_familiar_y_adulto(self, id_familiar: int, id_adulto_mayor: int) -> Optional[ConfiguracionRastreo]:
        ...

    @abstractmethod
    def obtener_todas_por_familiar(self, id_familiar: int) -> List[ConfiguracionRastreo]:
        """Devuelve todas las configuraciones de un familiar (todos sus adultos mayores)."""
        ...

    @abstractmethod
    def obtener_todas_por_adulto(self, id_adulto_mayor: int) -> List[ConfiguracionRastreo]:
        """Devuelve todas las configuraciones donde aparece este adulto mayor (todos sus familiares)."""
        ...

    @abstractmethod
    def activar_desactivar(self, id_adulto_mayor: int, activo: bool) -> int:
        """
        Activa o desactiva el rastreo en TODAS las configuraciones de un adulto mayor.
        Retorna el número de registros afectados.
        """
        ...

    @abstractmethod
    def obtener_frecuencia(self, id_adulto_mayor: int) -> Optional[int]:
        """
        Devuelve la frecuencia en minutos configurada para un adulto mayor.
        Si hay varios familiares, retorna la frecuencia mínima (más frecuente).
        """
        ...


class IEventPublisher(ABC):
    """Contrato para publicar eventos hacia otros microservicios (RabbitMQ)."""

    @abstractmethod
    def publicar_ubicacion(self, id_adulto_mayor: int, latitud: float, longitud: float) -> None:
        """Publica un evento de nueva ubicación para que el familiar sea notificado."""
        ...