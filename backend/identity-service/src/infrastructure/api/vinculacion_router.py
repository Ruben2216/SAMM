"""
Router: Vinculación — FastAPI
Endpoints para generar y validar códigos de vinculación familiar-adulto mayor,
y para configurar el círculo (nombre y rol).
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from src.domain.models.user import Usuario
from src.application.vinculacion_utils import calcular_parentesco_reciproco
from src.application.generar_codigo_use_case import GenerarCodigoUseCase
from src.application.validar_codigo_use_case import ValidarCodigoUseCase
from src.application.actualizar_circulo_use_case import ActualizarCirculoUseCase
from src.infrastructure.persistence.postgres_vinculacion_repository import PostgresVinculacionRepository
from src.infrastructure.persistence.postgres_repository import PostgresUserRepository
from src.infrastructure.api.dependencies import (
    obtener_generar_codigo_uc,
    obtener_validar_codigo_uc,
    obtener_actualizar_circulo_uc,
    obtener_usuario_actual,
    obtener_repositorio_vinculacion,
    obtener_repositorio,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vinculacion", tags=["Vinculación"])


# ===================== Schemas =====================

class GenerarCodigoResponse(BaseModel):
    codigo: str


class ValidarCodigoRequest(BaseModel):
    codigo: str


class VinculacionResponse(BaseModel):
    Id_Vinculacion: int
    Id_Familiar: int
    Id_Adulto_Mayor: int
    Nombre_Circulo: Optional[str] = None
    Rol_Adulto_Mayor: Optional[str] = None
    Rol_Familiar: Optional[str] = None
    mensaje: str


class ActualizarCirculoRequest(BaseModel):
    nombre_circulo: Optional[str] = None
    rol_adulto_mayor: Optional[str] = None


class MiVinculacionResponse(BaseModel):
    Id_Vinculacion: int
    Id_Familiar: int
    Id_Adulto_Mayor: int
    Nombre_Familiar: Optional[str] = None
    Nombre_Adulto_Mayor: Optional[str] = None
    url_Avatar_Familiar: Optional[str] = None
    url_Avatar_Adulto_Mayor: Optional[str] = None
    Nombre_Circulo: Optional[str] = None
    Rol_Adulto_Mayor: Optional[str] = None
    Rol_Familiar: Optional[str] = None


# ===================== Endpoints =====================

@router.post("/generar", response_model=GenerarCodigoResponse)
def generar_codigo(
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    caso_uso: GenerarCodigoUseCase = Depends(obtener_generar_codigo_uc),
):
    """
    Genera o retorna el código de vinculación del familiar autenticado.
    Requiere JWT en el header Authorization.
    """
    logger.info(f"[API] POST /vinculacion/generar — Id_Usuario: {usuario_actual.Id_Usuario}")

    try:
        codigo = caso_uso.ejecutar(usuario_actual.Id_Usuario)
        return GenerarCodigoResponse(codigo=codigo)
    except ValueError as e:
        logger.error(f"[API] Error generando código: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/validar", response_model=VinculacionResponse)
def validar_codigo(
    body: ValidarCodigoRequest,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    caso_uso: ValidarCodigoUseCase = Depends(obtener_validar_codigo_uc),
):
    """
    Valida un código de vinculación y crea el enlace.
    El adulto mayor envía el código del familiar.
    Requiere JWT en el header Authorization.
    """
    logger.info(f"[API] POST /vinculacion/validar — Id_Usuario: {usuario_actual.Id_Usuario}")

    try:
        vinculacion = caso_uso.ejecutar(usuario_actual.Id_Usuario, body.codigo)
        return VinculacionResponse(
            Id_Vinculacion=vinculacion.Id_Vinculacion,
            Id_Familiar=vinculacion.Id_Familiar,
            Id_Adulto_Mayor=vinculacion.Id_Adulto_Mayor,
            mensaje="Vinculación exitosa",
        )
    except ValueError as e:
        logger.error(f"[API] Error validando código: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/circulo/{id_vinculacion}", response_model=VinculacionResponse)
def actualizar_circulo(
    id_vinculacion: int,
    body: ActualizarCirculoRequest,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    caso_uso: ActualizarCirculoUseCase = Depends(obtener_actualizar_circulo_uc),
):
    """
    Actualiza el nombre del círculo y/o rol del adulto mayor en la vinculación.
    Requiere JWT en el header Authorization.
    """
    logger.info(f"[API] PUT /vinculacion/circulo/{id_vinculacion} — Id_Usuario: {usuario_actual.Id_Usuario}")

    try:
        vinculacion = caso_uso.ejecutar(
            id_vinculacion=id_vinculacion,
            id_adulto_mayor=usuario_actual.Id_Usuario,
            nombre_circulo=body.nombre_circulo,
            rol_adulto_mayor=body.rol_adulto_mayor,
        )
        return VinculacionResponse(
            Id_Vinculacion=vinculacion.Id_Vinculacion,
            Id_Familiar=vinculacion.Id_Familiar,
            Id_Adulto_Mayor=vinculacion.Id_Adulto_Mayor,
            Nombre_Circulo=vinculacion.Nombre_Circulo,
            Rol_Adulto_Mayor=vinculacion.Rol_Adulto_Mayor,
            Rol_Familiar=getattr(vinculacion, "Rol_Familiar", None),
            mensaje="Círculo actualizado",
        )
    except ValueError as e:
        logger.error(f"[API] Error actualizando círculo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/mis-vinculaciones", response_model=list[MiVinculacionResponse])
def mis_vinculaciones(
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    repo_vinculacion: PostgresVinculacionRepository = Depends(obtener_repositorio_vinculacion),
    repo_usuarios: PostgresUserRepository = Depends(obtener_repositorio),
):
    """
    Retorna las vinculaciones del usuario autenticado con los nombres
    de los usuarios vinculados. Funciona para familiares y adultos mayores.
    """
    logger.info(f"[API] GET /vinculacion/mis-vinculaciones — Id_Usuario: {usuario_actual.Id_Usuario}, Rol: {usuario_actual.Rol}")

    if usuario_actual.Rol == "familiar":
        vinculaciones = repo_vinculacion.buscar_por_familiar(usuario_actual.Id_Usuario)
    else:
        vinculaciones = repo_vinculacion.buscar_por_adulto_mayor(usuario_actual.Id_Usuario)

    resultado = []
    for v in vinculaciones:
        familiar = repo_usuarios.buscar_por_id(v.Id_Familiar)
        adulto = repo_usuarios.buscar_por_id(v.Id_Adulto_Mayor)

        rol_familiar = getattr(v, "Rol_Familiar", None)
        if not rol_familiar and v.Rol_Adulto_Mayor:
            sexo_adulto = getattr(adulto, "sexo", "Otro") if adulto else "Otro"
            rol_familiar = calcular_parentesco_reciproco(v.Rol_Adulto_Mayor, sexo_adulto)

        resultado.append(MiVinculacionResponse(
            Id_Vinculacion=v.Id_Vinculacion,
            Id_Familiar=v.Id_Familiar,
            Id_Adulto_Mayor=v.Id_Adulto_Mayor,
            Nombre_Familiar=familiar.Nombre if familiar else None,
            Nombre_Adulto_Mayor=adulto.Nombre if adulto else None,
            url_Avatar_Familiar=familiar.url_Avatar if familiar else None,
            url_Avatar_Adulto_Mayor=adulto.url_Avatar if adulto else None,
            Nombre_Circulo=v.Nombre_Circulo,
            Rol_Adulto_Mayor=v.Rol_Adulto_Mayor,
            Rol_Familiar=rol_familiar,
        ))

    return resultado
