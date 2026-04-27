
"""
Modelo SQLAlchemy: tabla Push_Tokens del Notification Service.
Un usuario puede tener múltiples tokens (un token por dispositivo).
El token en sí es único a nivel global (mismo token no puede pertenecer a dos usuarios).
"""
from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.sql import func

from src.infrastructure.database import Base


class PushTokenModel(Base):
    __tablename__ = "Push_Tokens"

    Id_Token = Column(Integer, primary_key=True, autoincrement=True)
    Id_Usuario = Column(Integer, nullable=False, index=True)
    Push_Token = Column(String(255), nullable=False, unique=True)
    Plataforma = Column(String(20), default="expo")
    Fecha_Actualizacion = Column(DateTime, server_default=func.now(), onupdate=func.now())
