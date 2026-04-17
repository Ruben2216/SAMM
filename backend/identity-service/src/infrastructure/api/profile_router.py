"""Router: Perfil de Usuario — FastAPI

CRUD del avatar del usuario autenticado.
"""

import logging
from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.domain.models.user import Usuario
from src.application.update_avatar_use_case import UpdateAvatarUseCase
from src.application.delete_avatar_use_case import DeleteAvatarUseCase
from src.infrastructure.persistence.postgres_vinculacion_repository import PostgresVinculacionRepository
from src.infrastructure.api.dependencies import (
    obtener_usuario_actual,
    obtener_actualizar_avatar_uc,
    obtener_eliminar_avatar_uc,
    obtener_repositorio_vinculacion,
)
from src.infrastructure.persistence.database import obtener_sesion
from src.infrastructure.persistence.sqlalchemy_models import EstadoDispositivoModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Perfil"])


class ActualizarAvatarRequest(BaseModel):
    imagen_base64: str
    mime_type: Optional[str] = None


class UsuarioPerfilResponse(BaseModel):
    Id_Usuario: int
    Nombre: str
    Correo: str
    Proveedor_Auth: str
    Rol: Optional[str]
    Activo: bool
    url_Avatar: Optional[str] = None

    class Config:
        from_attributes = True


class ActualizarBateriaRequest(BaseModel):
    porcentaje: int
    esta_cargando: bool


class EstadoBateriaResponse(BaseModel):
    Id_Usuario: int
    Bateria_Porcentaje: int
    Bateria_Cargando: bool
    Actualizado_En: datetime


@router.put("/me/avatar", response_model=UsuarioPerfilResponse)
def actualizar_avatar(
    body: ActualizarAvatarRequest,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    caso_uso: UpdateAvatarUseCase = Depends(obtener_actualizar_avatar_uc),
):
    logger.info(f"[API] PUT /users/me/avatar — Id_Usuario: {usuario_actual.Id_Usuario}")

    try:
        resultado = caso_uso.ejecutar(
            id_usuario=usuario_actual.Id_Usuario,
            imagen_base64=body.imagen_base64,
            mime_type=body.mime_type,
        )

        usuario = resultado["usuario"]
        return UsuarioPerfilResponse(
            Id_Usuario=usuario.Id_Usuario,
            Nombre=usuario.Nombre,
            Correo=usuario.Correo,
            Proveedor_Auth=usuario.Proveedor_Auth,
            Rol=usuario.Rol,
            Activo=usuario.Activo,
            url_Avatar=usuario.url_Avatar,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/me/avatar", response_model=UsuarioPerfilResponse)
def eliminar_avatar(
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    caso_uso: DeleteAvatarUseCase = Depends(obtener_eliminar_avatar_uc),
):
    logger.info(f"[API] DELETE /users/me/avatar — Id_Usuario: {usuario_actual.Id_Usuario}")

    try:
        resultado = caso_uso.ejecutar(id_usuario=usuario_actual.Id_Usuario)

        usuario = resultado["usuario"]
        return UsuarioPerfilResponse(
            Id_Usuario=usuario.Id_Usuario,
            Nombre=usuario.Nombre,
            Correo=usuario.Correo,
            Proveedor_Auth=usuario.Proveedor_Auth,
            Rol=usuario.Rol,
            Activo=usuario.Activo,
            url_Avatar=usuario.url_Avatar,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/me/bateria", response_model=EstadoBateriaResponse)
def actualizar_bateria(
    body: ActualizarBateriaRequest,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(obtener_sesion),
):
    logger.info(f"[API] PUT /users/me/bateria — Id_Usuario: {usuario_actual.Id_Usuario}")

    porcentaje = int(body.porcentaje)
    if porcentaje < 0 or porcentaje > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El porcentaje de batería debe estar entre 0 y 100",
        )

    ahora = datetime.now(timezone.utc)

    modelo = db.query(EstadoDispositivoModel).filter_by(Id_Usuario=usuario_actual.Id_Usuario).first()
    if not modelo:
        modelo = EstadoDispositivoModel(
            Id_Usuario=usuario_actual.Id_Usuario,
            Bateria_Porcentaje=porcentaje,
            Bateria_Cargando=bool(body.esta_cargando),
            Actualizado_En=ahora,
        )
        db.add(modelo)
    else:
        modelo.Bateria_Porcentaje = porcentaje
        modelo.Bateria_Cargando = bool(body.esta_cargando)
        modelo.Actualizado_En = ahora

    db.commit()
    db.refresh(modelo)

    return EstadoBateriaResponse(
        Id_Usuario=usuario_actual.Id_Usuario,
        Bateria_Porcentaje=modelo.Bateria_Porcentaje,
        Bateria_Cargando=modelo.Bateria_Cargando,
        Actualizado_En=modelo.Actualizado_En,
    )


# ===================== Internal (service-to-service) =====================


@router.get("/internal/vinculados/{id_usuario}")
def obtener_vinculados(
    id_usuario: int,
    repo_vinculacion: PostgresVinculacionRepository = Depends(obtener_repositorio_vinculacion),
):
    """Endpoint interno (sin auth) para otros microservicios.

    Retorna los IDs de usuarios vinculados a id_usuario,
    sea este un adulto mayor o un familiar.
    """

    # Si es adulto mayor, devuelve familiares. Si es familiar, devuelve adultos.
    vinc_como_adulto = repo_vinculacion.buscar_por_adulto_mayor(id_usuario)
    vinc_como_familiar = repo_vinculacion.buscar_por_familiar(id_usuario)

    familiares_ids = [v.Id_Familiar for v in vinc_como_adulto]
    adultos_ids = [v.Id_Adulto_Mayor for v in vinc_como_familiar]

    # Nombre de rol para alertas (ej. "Abuelo", "Papá")
    rol_adulto = None
    if vinc_como_adulto:
        rol_adulto = vinc_como_adulto[0].Rol_Adulto_Mayor

    return {
        "id_usuario": id_usuario,
        "familiares_ids": familiares_ids,
        "adultos_ids": adultos_ids,
        "rol_adulto_mayor": rol_adulto,
    }
