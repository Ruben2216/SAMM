"""
Modelos SQLAlchemy: Tablas Usuarios y Vinculaciones
Mapeados a PostgreSQL con nomenclatura en español.
"""
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey
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
    Codigo_Vinculacion = Column(String(5), unique=True, nullable=True)  # Solo familiares
    sexo = Column(String(10), nullable=False, default="Otro")
    Activo = Column(Boolean, default=True)
    Fecha_Registro = Column(Date, nullable=False, server_default=func.current_date())


class VinculacionModel(Base):
    """Modelo de persistencia para la tabla Vinculaciones."""
    __tablename__ = "Vinculaciones"

    Id_Vinculacion = Column(Integer, primary_key=True, autoincrement=True)
    Id_Familiar = Column(Integer, ForeignKey("Usuarios.Id_Usuario"), nullable=False)
    Id_Adulto_Mayor = Column(Integer, ForeignKey("Usuarios.Id_Usuario"), nullable=False)
    Nombre_Circulo = Column(String(100), nullable=True)
    Rol_Adulto_Mayor = Column(String(50), nullable=True)
    Rol_Familiar = Column(String(50), nullable=True)
    Fecha_Vinculacion = Column(DateTime, server_default=func.now())


class EstadoDispositivoModel(Base):
    """Modelo de persistencia para el último estado del dispositivo (batería)."""
    __tablename__ = "Estados_Dispositivo"

    Id_Usuario = Column(Integer, ForeignKey("Usuarios.Id_Usuario", ondelete="CASCADE"), primary_key=True)
    Bateria_Porcentaje = Column(Integer, nullable=False)
    Bateria_Cargando = Column(Boolean, nullable=False, default=False)
    Actualizado_En = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


class DispositivoModel(Base):
    """Modelo de persistencia para tokens de dispositivo (para reportes en background)."""
    __tablename__ = "Dispositivos"

    Id_Dispositivo = Column(Integer, primary_key=True, autoincrement=True)
    Id_Usuario = Column(Integer, ForeignKey("Usuarios.Id_Usuario", ondelete="CASCADE"), nullable=False, index=True)

    # Guardamos solo el hash para que el token no quede expuesto en BD.
    Token_Hash = Column(String(64), unique=True, nullable=False, index=True)

    Activo = Column(Boolean, nullable=False, default=True)

    Creado_En = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    Ultimo_Uso_En = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
