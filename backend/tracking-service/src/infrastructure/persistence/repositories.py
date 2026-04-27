"""
Implementaciones concretas de los repositorios usando SQLAlchemy.
Estos son los "Adapters" en la arquitectura hexagonal.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from src.domain.models.tracking_models import Ubicacion, ConfiguracionRastreo
from src.domain.ports.repositories import IUbicacionRepository, IConfiguracionRepository


class SQLAlchemyUbicacionRepository(IUbicacionRepository):
    def __init__(self, db: Session):
        self._db = db

    def guardar(self, ubicacion: Ubicacion) -> Ubicacion:
        self._db.add(ubicacion)
        self._db.commit()
        self._db.refresh(ubicacion)
        # El trigger de PostgreSQL elimina las más antiguas automáticamente
        return ubicacion

    def obtener_ultimas_por_adulto(self, id_adulto_mayor: int) -> List[Ubicacion]:
        return (
            self._db.query(Ubicacion)
            .filter(Ubicacion.Id_Adulto_Mayor == id_adulto_mayor)
            .order_by(Ubicacion.Fecha_Hora.desc())
            .limit(4)
            .all()
        )

    def obtener_ultima(self, id_adulto_mayor: int) -> Optional[Ubicacion]:
        return (
            self._db.query(Ubicacion)
            .filter(Ubicacion.Id_Adulto_Mayor == id_adulto_mayor)
            .order_by(Ubicacion.Fecha_Hora.desc())
            .first()
        )


class SQLAlchemyConfiguracionRepository(IConfiguracionRepository):
    def __init__(self, db: Session):
        self._db = db

    def crear_o_actualizar(self, config: ConfiguracionRastreo) -> ConfiguracionRastreo:
        self._db.merge(config)
        self._db.commit()
        # Re-query para obtener el objeto actualizado con su Id_Config
        resultado = self.obtener_por_familiar_y_adulto(config.Id_Familiar, config.Id_Adulto_Mayor)
        return resultado

    def obtener_por_familiar_y_adulto(
        self, id_familiar: int, id_adulto_mayor: int
    ) -> Optional[ConfiguracionRastreo]:
        return (
            self._db.query(ConfiguracionRastreo)
            .filter(
                ConfiguracionRastreo.Id_Familiar     == id_familiar,
                ConfiguracionRastreo.Id_Adulto_Mayor == id_adulto_mayor,
            )
            .first()
        )

    def obtener_todas_por_familiar(self, id_familiar: int) -> List[ConfiguracionRastreo]:
        return (
            self._db.query(ConfiguracionRastreo)
            .filter(ConfiguracionRastreo.Id_Familiar == id_familiar)
            .all()
        )

    def obtener_todas_por_adulto(self, id_adulto_mayor: int) -> List[ConfiguracionRastreo]:
        return (
            self._db.query(ConfiguracionRastreo)
            .filter(ConfiguracionRastreo.Id_Adulto_Mayor == id_adulto_mayor)
            .all()
        )

    def activar_desactivar(self, id_adulto_mayor: int, activo: bool) -> int:
        afectados = (
            self._db.query(ConfiguracionRastreo)
            .filter(ConfiguracionRastreo.Id_Adulto_Mayor == id_adulto_mayor)
            .update({"Activo": activo})
        )
        self._db.commit()
        return afectados

    def obtener_frecuencia(self, id_adulto_mayor: int) -> Optional[int]:
        """
        Retorna la frecuencia mínima entre todos los familiares del adulto mayor
        que tengan el rastreo activo. Si ninguno tiene activo, retorna None.
        """
        resultado = (
            self._db.query(func.min(ConfiguracionRastreo.Frecuencia_Minutos))
            .filter(
                ConfiguracionRastreo.Id_Adulto_Mayor == id_adulto_mayor,
                ConfiguracionRastreo.Activo          == True,
            )
            .scalar()
        )
        return resultado