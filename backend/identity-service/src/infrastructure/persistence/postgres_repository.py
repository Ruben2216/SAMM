"""
Repositorio: PostgreSQL
Implementación concreta del UserRepositoryPort usando SQLAlchemy.
"""
import logging
from typing import Optional
from datetime import date

from sqlalchemy.orm import Session

from src.domain.models.user import Usuario
from src.domain.ports.user_repository_port import UserRepositoryPort
from src.infrastructure.persistence.sqlalchemy_models import UsuarioModel

logger = logging.getLogger(__name__)


class PostgresUserRepository(UserRepositoryPort):
    """Implementación del repositorio de usuarios con PostgreSQL."""

    def __init__(self, sesion: Session):
        self._sesion = sesion

    def _modelo_a_entidad(self, modelo: UsuarioModel) -> Usuario:
        """Convierte un modelo SQLAlchemy a una entidad de dominio."""
        return Usuario(
            Id_Usuario=modelo.Id_Usuario,
            Nombre=modelo.Nombre,
            Correo=modelo.Correo,
            Contrasena_Hash=modelo.Contrasena_Hash,
            Proveedor_Auth=modelo.Proveedor_Auth,
            Google_Id=modelo.Google_Id,
            url_Avatar=getattr(modelo, "url_Avatar", None),
            Rol=modelo.Rol,
            Activo=modelo.Activo,
            Fecha_Registro=modelo.Fecha_Registro,
        )

    def _entidad_a_modelo(self, usuario: Usuario) -> UsuarioModel:
        """Convierte una entidad de dominio a un modelo SQLAlchemy."""
        return UsuarioModel(
            Id_Usuario=usuario.Id_Usuario if usuario.Id_Usuario else None,
            Nombre=usuario.Nombre,
            Correo=usuario.Correo,
            Contrasena_Hash=usuario.Contrasena_Hash,
            Proveedor_Auth=usuario.Proveedor_Auth,
            Google_Id=usuario.Google_Id,
            url_Avatar=usuario.url_Avatar,
            Rol=usuario.Rol,
            Activo=usuario.Activo,
            Fecha_Registro=usuario.Fecha_Registro or date.today(),
        )

    def buscar_por_correo(self, correo: str) -> Optional[Usuario]:
        logger.info(f"[Repo] Buscando usuario por Correo: {correo}")
        modelo = self._sesion.query(UsuarioModel).filter_by(Correo=correo).first()
        if modelo:
            logger.info(f"[Repo] Usuario encontrado — Id_Usuario: {modelo.Id_Usuario}")
            return self._modelo_a_entidad(modelo)
        logger.info(f"[Repo] Usuario NO encontrado por correo")
        return None

    def buscar_por_google_id(self, google_id: str) -> Optional[Usuario]:
        logger.info(f"[Repo] Buscando usuario por Google_Id: {google_id}")
        modelo = self._sesion.query(UsuarioModel).filter_by(Google_Id=google_id).first()
        if modelo:
            logger.info(f"[Repo] Usuario encontrado — Id_Usuario: {modelo.Id_Usuario}")
            return self._modelo_a_entidad(modelo)
        logger.info(f"[Repo] Usuario NO encontrado por Google_Id")
        return None

    def buscar_por_id(self, id_usuario: int) -> Optional[Usuario]:
        logger.info(f"[Repo] Buscando usuario por Id_Usuario: {id_usuario}")
        modelo = self._sesion.query(UsuarioModel).filter_by(Id_Usuario=id_usuario).first()
        if modelo:
            return self._modelo_a_entidad(modelo)
        logger.info(f"[Repo] Usuario NO encontrado por Id")
        return None

    def guardar(self, usuario: Usuario) -> Usuario:
        logger.info(f"[Repo] Guardando nuevo usuario — Correo: {usuario.Correo}")
        modelo = self._entidad_a_modelo(usuario)
        # No asignar Id_Usuario para que SERIAL lo genere
        modelo.Id_Usuario = None
        self._sesion.add(modelo)
        self._sesion.commit()
        self._sesion.refresh(modelo)
        logger.info(f"[Repo] Usuario guardado — Id_Usuario: {modelo.Id_Usuario}")
        return self._modelo_a_entidad(modelo)

    def actualizar(self, usuario: Usuario) -> Usuario:
        logger.info(f"[Repo] Actualizando usuario — Id_Usuario: {usuario.Id_Usuario}")
        modelo = self._sesion.query(UsuarioModel).filter_by(
            Id_Usuario=usuario.Id_Usuario
        ).first()
        if not modelo:
            raise ValueError(f"Usuario con Id_Usuario={usuario.Id_Usuario} no encontrado")

        modelo.Nombre = usuario.Nombre
        modelo.Correo = usuario.Correo
        modelo.Contrasena_Hash = usuario.Contrasena_Hash
        modelo.Proveedor_Auth = usuario.Proveedor_Auth
        modelo.Google_Id = usuario.Google_Id
        modelo.url_Avatar = usuario.url_Avatar
        modelo.Rol = usuario.Rol
        modelo.Activo = usuario.Activo

        self._sesion.commit()
        self._sesion.refresh(modelo)
        logger.info(f"[Repo] Usuario actualizado exitosamente")
        return self._modelo_a_entidad(modelo)
