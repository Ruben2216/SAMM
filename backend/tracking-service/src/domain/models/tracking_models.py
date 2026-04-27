from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Numeric, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from src.infrastructure.persistence.database import Base


# Tabla 1: Configuración de Rastreo
# Relación Familiar -> Adulto Mayor (uno a muchos):
# Un familiar puede tener configuración para VARIOS adultos mayores.
class ConfiguracionRastreo(Base):
    __tablename__ = "Configuracion_Rastreo"

    Id_Config           = Column(Integer, primary_key=True, index=True)
    Id_Familiar         = Column(Integer, nullable=False, index=True)
    Id_Adulto_Mayor     = Column(Integer, nullable=False, index=True)
    Frecuencia_Minutos  = Column(Integer, nullable=False, default=10)
    Activo              = Column(Boolean, default=False)
    Fecha_Actualizacion = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("Id_Familiar", "Id_Adulto_Mayor", name="uq_familiar_adulto"),
    )


# Tabla 2: Ubicaciones
# Máximo 4 registros por adulto mayor (controlado por trigger en PostgreSQL).
class Ubicacion(Base):
    __tablename__ = "Ubicaciones"

    Id_Ubicacion     = Column(Integer, primary_key=True, index=True)
    Id_Adulto_Mayor  = Column(Integer, nullable=False, index=True)
    Latitud          = Column(Numeric(10, 8), nullable=False)
    Longitud         = Column(Numeric(11, 8), nullable=False)
    Fecha_Hora       = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    Precision_Metros = Column(Numeric(6, 2), nullable=True)