from sqlalchemy import Column, Integer, String, DateTime, Text
from src.infrastructure.database import Base
import datetime

class Cita(Base):
    __tablename__ = "Citas"

    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, index=True, nullable=False) 
    id_usuario_creador = Column(Integer, nullable=False) 
    doctor_nombre = Column(String(100), nullable=False)
    especialidad = Column(String(100))
    fecha_hora = Column(DateTime, default=datetime.datetime.utcnow)
    ubicacion = Column(String(255))
    notas = Column(Text, nullable=True)
    estado = Column(String(50), default="programada")