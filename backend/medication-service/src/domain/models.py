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
    # CSV de isoweekday: 1=Lunes ... 7=Domingo. Default = todos los días.
    Dias_Semana = Column(String(20), nullable=False, default="1,2,3,4,5,6,7")

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

# Tabla 4: Perfil de Salud del Adulto Mayor
class PerfilSalud(Base):
    __tablename__ = "Perfiles_Salud"

    Id_Perfil = Column(Integer, primary_key=True, index=True)
    Id_Usuario = Column(Integer, nullable=False, unique=True, index=True)
    Tipo_Sangre = Column(String(20), nullable=True)
    Alergias = Column(String(500), nullable=True)
    Peso = Column(String(20), nullable=True)
    Edad = Column(Integer, nullable=True)
    Condicion_Medica = Column(String(500), nullable=True)
    Telefono = Column(String(30), nullable=True)