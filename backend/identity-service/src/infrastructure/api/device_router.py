"""Router: Dispositivos — FastAPI

Registro de tokens de dispositivo y reporte de batería desde background (Android).

Importante:
- El token de dispositivo SOLO se devuelve una vez al registrarlo.
- En la base de datos se almacena únicamente el hash del token.
"""

import logging
import secrets
import hashlib
from datetime import datetime, timezone

from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.domain.models.user import Usuario
from src.infrastructure.api.dependencies import obtener_usuario_actual
from src.infrastructure.persistence.database import obtener_sesion
from src.infrastructure.persistence.sqlalchemy_models import DispositivoModel, EstadoDispositivoModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/devices", tags=["Dispositivos"])


class RegistroDispositivoResponse(BaseModel):
    token_dispositivo: str


class ActualizarBateriaDispositivoRequest(BaseModel):
    porcentaje: int
    esta_cargando: bool


class EstadoBateriaResponse(BaseModel):
    Id_Usuario: int
    Bateria_Porcentaje: int
    Bateria_Cargando: bool
    Actualizado_En: datetime


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@router.post("/registro", response_model=RegistroDispositivoResponse)
def registrar_dispositivo(
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(obtener_sesion),
):
    """Genera y registra un token de dispositivo para el usuario autenticado."""
    logger.info(f"[API] POST /devices/registro — Id_Usuario: {usuario_actual.Id_Usuario}")

    token_plano = secrets.token_urlsafe(48)
    token_hash = _hash_token(token_plano)

    dispositivo = DispositivoModel(
        Id_Usuario=usuario_actual.Id_Usuario,
        Token_Hash=token_hash,
        Activo=True,
    )

    try:
        db.add(dispositivo)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"[API] Error registrando dispositivo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo registrar el dispositivo",
        )

    # El token se devuelve una sola vez; el cliente debe persistirlo localmente.
    return RegistroDispositivoResponse(token_dispositivo=token_plano)


@router.put("/bateria", response_model=EstadoBateriaResponse)
def actualizar_bateria_desde_dispositivo(
    body: ActualizarBateriaDispositivoRequest,
    x_device_token: Optional[str] = Header(default=None, alias="X-Device-Token"),
    db: Session = Depends(obtener_sesion),
):
    """Actualiza batería usando token de dispositivo (para servicios en background)."""
    if not x_device_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falta el token de dispositivo",
        )

    token_hash = _hash_token(x_device_token)

    dispositivo = (
        db.query(DispositivoModel)
        .filter(DispositivoModel.Token_Hash == token_hash, DispositivoModel.Activo.is_(True))
        .first()
    )

    if not dispositivo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de dispositivo inválido",
        )

    porcentaje = int(body.porcentaje)
    if porcentaje < 0 or porcentaje > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El porcentaje de batería debe estar entre 0 y 100",
        )

    ahora = datetime.now(timezone.utc)

    estado = db.query(EstadoDispositivoModel).filter_by(Id_Usuario=dispositivo.Id_Usuario).first()
    if not estado:
        estado = EstadoDispositivoModel(
            Id_Usuario=dispositivo.Id_Usuario,
            Bateria_Porcentaje=porcentaje,
            Bateria_Cargando=bool(body.esta_cargando),
            Actualizado_En=ahora,
        )
        db.add(estado)
    else:
        estado.Bateria_Porcentaje = porcentaje
        estado.Bateria_Cargando = bool(body.esta_cargando)
        estado.Actualizado_En = ahora

    dispositivo.Ultimo_Uso_En = ahora

    db.commit()
    db.refresh(estado)

    return EstadoBateriaResponse(
        Id_Usuario=dispositivo.Id_Usuario,
        Bateria_Porcentaje=estado.Bateria_Porcentaje,
        Bateria_Cargando=estado.Bateria_Cargando,
        Actualizado_En=estado.Actualizado_En,
    )
