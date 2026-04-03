from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Time, Date, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from src.infrastructure.database import Base

# Tabla 1: Medicamentos
class Medicamento(Base):
    __tablename__ = "Medicamentos"

    Id_Medicamento = Column(Integer, primary_key=True, index=True)
    Id_Usuario = Column(Integer, nullable=False, index=True)
    Nombre = Column(String(150), nullable=False)
    Dosis = Column(String(100), nullable=False)
    Frecuencia = Column(String(100), nullable=False)
    Notas = Column(String(500), nullable=True)
    Activo = Column(Boolean, default=True)
    Fecha_Creacion = Column(DateTime, default=datetime.utcnow)

    # Relaciones para que Python pueda navegar fácilmente entre tablas
    horarios = relationship("Horario", back_populates="medicamento", cascade="all, delete-orphan")
    historial = relationship("HistorialToma", back_populates="medicamento", cascade="all, delete-orphan")

# Tabla 2: Horarios
class Horario(Base):
    __tablename__ = "Horarios"

    Id_Horario = Column(Integer, primary_key=True, index=True)
    Id_Medicamento = Column(Integer, ForeignKey("Medicamentos.Id_Medicamento", ondelete="CASCADE"))
    Hora_Toma = Column(Time, nullable=False)

    medicamento = relationship("Medicamento", back_populates="horarios")

# Tabla 3: Historial y Cumplimiento
class HistorialToma(Base):
    __tablename__ = "Historial_Tomas"

    Id_Historial = Column(Integer, primary_key=True, index=True)
    Id_Medicamento = Column(Integer, ForeignKey("Medicamentos.Id_Medicamento", ondelete="CASCADE"))
    Fecha_Asignada = Column(Date, nullable=False)
    Hora_Asignada = Column(Time, nullable=False)
    Estado = Column(String(20), default="pendiente")
    Fecha_Hora_Real_Toma = Column(DateTime, nullable=True)
    Alerta_Enviada_Familiar = Column(Boolean, default=False)

    medicamento = relationship("Medicamento", back_populates="historial")