"""
Inyección de Dependencias — FastAPI
Conecta los puertos (interfaces abstractas) con sus implementaciones concretas.
Este es el único lugar donde se conocen las implementaciones de infraestructura.
"""
import logging
import os
from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from src.infrastructure.persistence.database import obtener_sesion
from src.infrastructure.persistence.postgres_repository import PostgresUserRepository
from src.infrastructure.security.google_verifier import GoogleTokenVerifier
from src.infrastructure.security.jwt_service import JWTService
from src.infrastructure.security.bcrypt_hasher import BcryptHasher

from src.infrastructure.services.local_avatar_storage import LocalAvatarStorage

from src.application.google_login_use_case import GoogleLoginUseCase
from src.application.login_user_use_case import LoginUserUseCase
from src.application.register_user_use_case import RegisterUserUseCase
from src.application.update_role_use_case import UpdateRoleUseCase
from src.application.update_avatar_use_case import UpdateAvatarUseCase
from src.application.delete_avatar_use_case import DeleteAvatarUseCase
from src.application.generar_codigo_use_case import GenerarCodigoUseCase
from src.application.validar_codigo_use_case import ValidarCodigoUseCase
from src.application.actualizar_circulo_use_case import ActualizarCirculoUseCase

from src.infrastructure.persistence.postgres_vinculacion_repository import PostgresVinculacionRepository

logger = logging.getLogger(__name__)

# Esquema de seguridad para extraer el Bearer token
esquema_seguridad = HTTPBearer()


# --- Adaptadores (implementaciones concretas) ---

def obtener_repositorio(db: Session = Depends(obtener_sesion)) -> PostgresUserRepository:
    return PostgresUserRepository(db)


def obtener_verificador_google() -> GoogleTokenVerifier:
    return GoogleTokenVerifier()


def obtener_servicio_jwt() -> JWTService:
    return JWTService()


def obtener_hasher() -> BcryptHasher:
    return BcryptHasher()


def obtener_storage_avatar() -> LocalAvatarStorage:
    # Directorio base para servir /media (ver main.py). Ajustable vía env.
    directorio_base = os.getenv("SAMM_MEDIA_DIR", "uploads")
    return LocalAvatarStorage(directorio_base)


# --- Casos de uso ---

def obtener_google_login_uc(
    repo: PostgresUserRepository = Depends(obtener_repositorio),
    google: GoogleTokenVerifier = Depends(obtener_verificador_google),
    jwt_svc: JWTService = Depends(obtener_servicio_jwt),
) -> GoogleLoginUseCase:
    return GoogleLoginUseCase(repo, google, jwt_svc)


def obtener_login_uc(
    repo: PostgresUserRepository = Depends(obtener_repositorio),
    hasher: BcryptHasher = Depends(obtener_hasher),
    jwt_svc: JWTService = Depends(obtener_servicio_jwt),
) -> LoginUserUseCase:
    return LoginUserUseCase(repo, hasher, jwt_svc)


def obtener_registro_uc(
    repo: PostgresUserRepository = Depends(obtener_repositorio),
    hasher: BcryptHasher = Depends(obtener_hasher),
    jwt_svc: JWTService = Depends(obtener_servicio_jwt),
) -> RegisterUserUseCase:
    return RegisterUserUseCase(repo, hasher, jwt_svc)


def obtener_actualizar_rol_uc(
    repo: PostgresUserRepository = Depends(obtener_repositorio),
    jwt_svc: JWTService = Depends(obtener_servicio_jwt),
) -> UpdateRoleUseCase:
    return UpdateRoleUseCase(repo, jwt_svc)


def obtener_actualizar_avatar_uc(
    repo: PostgresUserRepository = Depends(obtener_repositorio),
    storage: LocalAvatarStorage = Depends(obtener_storage_avatar),
) -> UpdateAvatarUseCase:
    return UpdateAvatarUseCase(repo, storage)


def obtener_eliminar_avatar_uc(
    repo: PostgresUserRepository = Depends(obtener_repositorio),
    storage: LocalAvatarStorage = Depends(obtener_storage_avatar),
) -> DeleteAvatarUseCase:
    return DeleteAvatarUseCase(repo, storage)


def obtener_repositorio_vinculacion(db: Session = Depends(obtener_sesion)) -> PostgresVinculacionRepository:
    return PostgresVinculacionRepository(db)


def obtener_generar_codigo_uc(
    repo: PostgresUserRepository = Depends(obtener_repositorio),
) -> GenerarCodigoUseCase:
    return GenerarCodigoUseCase(repo)


def obtener_validar_codigo_uc(
    repo: PostgresUserRepository = Depends(obtener_repositorio),
    repo_vinculacion: PostgresVinculacionRepository = Depends(obtener_repositorio_vinculacion),
) -> ValidarCodigoUseCase:
    return ValidarCodigoUseCase(repo, repo_vinculacion)


def obtener_actualizar_circulo_uc(
    repo_vinculacion: PostgresVinculacionRepository = Depends(obtener_repositorio_vinculacion),
) -> ActualizarCirculoUseCase:
    return ActualizarCirculoUseCase(repo_vinculacion)


# --- Autenticación del usuario actual ---

def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(esquema_seguridad),
    jwt_svc: JWTService = Depends(obtener_servicio_jwt),
    repo: PostgresUserRepository = Depends(obtener_repositorio),
):
    """
    Dependencia que extrae y verifica el JWT del header Authorization.
    Retorna el usuario autenticado.
    """
    try:
        payload = jwt_svc.verificar_token(credenciales.credentials)
        id_usuario = int(payload["sub"])
    except (ValueError, KeyError) as e:
        logger.error(f"[Auth] Error verificando token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de sesión inválido o expirado",
        )

    usuario = repo.buscar_por_id(id_usuario)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
        )

    return usuario
