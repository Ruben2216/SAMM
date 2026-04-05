"""
Modelo SQLAlchemy: Tabla Usuarios
Mapeado a la tabla 'Usuarios' en PostgreSQL con nomenclatura en español.
"""
from sqlalchemy import Column, Integer, String, Boolean, Date
from sqlalchemy.sql import func

from src.infrastructure.persistence.database import Base


class UsuarioModel(Base):
    """Modelo de persistencia para la tabla Usuarios."""
    __tablename__ = "Usuarios"

    Id_Usuario = Column(Integer, primary_key=True, autoincrement=True)
    Nombre = Column(String(150), nullable=False)
    Correo = Column(String(255), unique=True, nullable=False, index=True)
    Contrasena_Hash = Column(String(255), nullable=True)       # NULL si es cuenta de Google
    Proveedor_Auth = Column(String(20), nullable=False, default="local")  # 'local' | 'google'
    Google_Id = Column(String(255), unique=True, nullable=True, index=True)
    url_Avatar = Column("url_Avatar", String(2048), nullable=True)
    Rol = Column(String(20), nullable=True)                    # 'familiar' | 'adulto_mayor' | NULL
    Activo = Column(Boolean, default=True)
    Fecha_Registro = Column(Date, nullable=False, server_default=func.current_date())
