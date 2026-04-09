# Actualizar circulo (permite al adulto mayor asignar nombre y rol a su vinculación (círculo))
import logging
from typing import Optional

from src.domain.models.vinculacion import Vinculacion
from src.domain.ports.vinculacion_repository_port import VinculacionRepositoryPort

logger = logging.getLogger(__name__)


class ActualizarCirculoUseCase:

    def __init__(self, repositorio_vinculacion: VinculacionRepositoryPort):
        self._repo = repositorio_vinculacion

    def ejecutar(
        self,
        id_vinculacion: int,
        id_adulto_mayor: int,
        nombre_circulo: Optional[str] = None,
        rol_adulto_mayor: Optional[str] = None,
    ) -> Vinculacion:
        vinculacion = self._repo.buscar_por_id(id_vinculacion)
        if not vinculacion:
            raise ValueError("Vinculación no encontrada")

        if vinculacion.Id_Adulto_Mayor != id_adulto_mayor:
            raise ValueError("No tienes permiso para modificar esta vinculación")

        if nombre_circulo is not None:
            vinculacion.Nombre_Circulo = nombre_circulo
            logger.info(f"[ActualizarCirculo] Nombre: {nombre_circulo}")

        if rol_adulto_mayor is not None:
            vinculacion.Rol_Adulto_Mayor = rol_adulto_mayor
            logger.info(f"[ActualizarCirculo] Rol: {rol_adulto_mayor}")

        vinculacion = self._repo.actualizar(vinculacion)
        return vinculacion
