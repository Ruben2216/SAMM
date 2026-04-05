"""Router: Perfil de Usuario — FastAPI

CRUD del avatar del usuario autenticado.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from src.domain.models.user import Usuario
from src.application.update_avatar_use_case import UpdateAvatarUseCase
from src.application.delete_avatar_use_case import DeleteAvatarUseCase
from src.infrastructure.api.dependencies import (
    obtener_usuario_actual,
    obtener_actualizar_avatar_uc,
    obtener_eliminar_avatar_uc,
)

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
