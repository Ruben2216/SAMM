import logging
from typing import List

from sqlalchemy.orm import Session

from src.domain.models.vinculacion import Vinculacion
from src.domain.ports.vinculacion_repository_port import VinculacionRepositoryPort
from src.infrastructure.persistence.sqlalchemy_models import VinculacionModel

logger = logging.getLogger(__name__)


class PostgresVinculacionRepository(VinculacionRepositoryPort):
    """Implementación del repositorio de vinculaciones con PostgreSQL."""

    def __init__(self, sesion: Session):
        self._sesion = sesion

    def _modelo_a_entidad(self, modelo: VinculacionModel) -> Vinculacion:
        return Vinculacion(
            Id_Vinculacion=modelo.Id_Vinculacion,
            Id_Familiar=modelo.Id_Familiar,
            Id_Adulto_Mayor=modelo.Id_Adulto_Mayor,
            Nombre_Circulo=modelo.Nombre_Circulo,
            Rol_Adulto_Mayor=modelo.Rol_Adulto_Mayor,
            Rol_Familiar=getattr(modelo, "Rol_Familiar", None),
            Fecha_Vinculacion=modelo.Fecha_Vinculacion,
        )

    def guardar(self, vinculacion: Vinculacion) -> Vinculacion:
        logger.info(f"[Repo] Guardando vinculación — Familiar: {vinculacion.Id_Familiar}, Adulto: {vinculacion.Id_Adulto_Mayor}")
        modelo = VinculacionModel(
            Id_Familiar=vinculacion.Id_Familiar,
            Id_Adulto_Mayor=vinculacion.Id_Adulto_Mayor,
        )
        self._sesion.add(modelo)
        self._sesion.commit()
        self._sesion.refresh(modelo)
        logger.info(f"[Repo] Vinculación guardada — Id: {modelo.Id_Vinculacion}")
        return self._modelo_a_entidad(modelo)

    def buscar_por_familiar(self, id_familiar: int) -> List[Vinculacion]:
        modelos = self._sesion.query(VinculacionModel).filter_by(Id_Familiar=id_familiar).all()
        return [self._modelo_a_entidad(m) for m in modelos]

    def buscar_por_adulto_mayor(self, id_adulto_mayor: int) -> List[Vinculacion]:
        modelos = self._sesion.query(VinculacionModel).filter_by(Id_Adulto_Mayor=id_adulto_mayor).all()
        return [self._modelo_a_entidad(m) for m in modelos]

    def existe_vinculacion(self, id_familiar: int, id_adulto_mayor: int) -> bool:
        existe = self._sesion.query(VinculacionModel).filter_by(
            Id_Familiar=id_familiar,
            Id_Adulto_Mayor=id_adulto_mayor,
        ).first()
        return existe is not None

    def buscar_por_id(self, id_vinculacion: int):
        modelo = self._sesion.query(VinculacionModel).filter_by(Id_Vinculacion=id_vinculacion).first()
        if modelo:
            return self._modelo_a_entidad(modelo)
        return None

    def actualizar(self, vinculacion: Vinculacion) -> Vinculacion:
        logger.info(f"[Repo] Actualizando vinculación — Id: {vinculacion.Id_Vinculacion}")
        modelo = self._sesion.query(VinculacionModel).filter_by(
            Id_Vinculacion=vinculacion.Id_Vinculacion
        ).first()
        if not modelo:
            raise ValueError(f"Vinculación {vinculacion.Id_Vinculacion} no encontrada")
        modelo.Nombre_Circulo = vinculacion.Nombre_Circulo
        modelo.Rol_Adulto_Mayor = vinculacion.Rol_Adulto_Mayor
        modelo.Rol_Familiar = getattr(vinculacion, "Rol_Familiar", None)
        self._sesion.commit()
        self._sesion.refresh(modelo)
        return self._modelo_a_entidad(modelo)
