
"""
Router del Notification Service.
"""
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert

from src.infrastructure.database import obtener_sesion
from src.domain.models import PushTokenModel
from src.domain import schemas
from src.application.push_service import (
    enviar_push_a_tokens,
    obtener_vinculados,
    obtener_nombre_usuario,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Notifications"])


# --------- Gestión de tokens ---------

@router.put("/push-tokens", response_model=schemas.TokenResponse)
def guardar_token(
    body: schemas.GuardarTokenRequest,
    db: Session = Depends(obtener_sesion),
):
    """
    Guarda o actualiza un push token.
    Un usuario puede tener múltiples tokens (varios dispositivos).
    Upsert por Push_Token: si el token ya existe, actualiza su Id_Usuario.
    """
    logger.info(f"[API] PUT /push-tokens — Id_Usuario: {body.id_usuario}")

    stmt = insert(PushTokenModel).values(
        Id_Usuario=body.id_usuario,
        Push_Token=body.push_token,
        Plataforma=body.plataforma or "expo",
    )
    stmt = stmt.on_conflict_do_update(
        index_elements=["Push_Token"],
        set_={
            "Id_Usuario": body.id_usuario,
            "Plataforma": body.plataforma or "expo",
        },
    )
    db.execute(stmt)
    db.commit()

    return schemas.TokenResponse(
        id_usuario=body.id_usuario,
        push_token=body.push_token,
        plataforma=body.plataforma or "expo",
    )


@router.delete("/push-tokens/token/{push_token}")
def eliminar_token_por_valor(push_token: str, db: Session = Depends(obtener_sesion)):
    """Elimina un token específico (al cerrar sesión en un dispositivo)."""
    db.query(PushTokenModel).filter_by(Push_Token=push_token).delete()
    db.commit()
    return {"mensaje": "Token eliminado"}


@router.delete("/push-tokens/{id_usuario}")
def eliminar_tokens_usuario(id_usuario: int, db: Session = Depends(obtener_sesion)):
    """Elimina TODOS los tokens de un usuario (si se necesita limpiar)."""
    db.query(PushTokenModel).filter_by(Id_Usuario=id_usuario).delete()
    db.commit()
    return {"mensaje": "Tokens eliminados"}


# --------- Envío de notificaciones ---------

def _tokens_por_ids(db: Session, ids: list[int]) -> list[str]:
    """Retorna todos los push tokens de los IDs de usuario dados (múltiples por usuario)."""
    if not ids:
        return []
    registros = db.query(PushTokenModel).filter(PushTokenModel.Id_Usuario.in_(ids)).all()
    return [r.Push_Token for r in registros if r.Push_Token]


@router.post("/notificar/usuarios")
def notificar_usuarios(
    body: schemas.NotificarUsuariosRequest,
    db: Session = Depends(obtener_sesion),
):
    """Envía push notification a una lista específica de IDs de usuarios."""
    logger.info(f"[API] POST /notificar/usuarios — IDs: {body.ids_usuarios}")
    tokens = _tokens_por_ids(db, body.ids_usuarios)
    resultado = enviar_push_a_tokens(tokens, body.titulo, body.cuerpo, body.datos)
    return resultado


@router.post("/notificar/familiares")
def notificar_familiares(
    body: schemas.NotificarVinculadosRequest,
    db: Session = Depends(obtener_sesion),
):
    """
    Envía push informativo a todos los familiares del adulto mayor.
    También enriquece los datos con nombre y rol del adulto.
    """
    logger.info(f"[API] POST /notificar/familiares — Id_Adulto: {body.id_usuario}")

    vinculados = obtener_vinculados(body.id_usuario)
    familiares_ids = vinculados.get("familiares_ids", [])

    if not familiares_ids:
        logger.info(f"[API] Adulto {body.id_usuario} sin familiares vinculados")
        return {"status": "sin_familiares", "enviados": 0}

    datos = dict(body.datos or {})
    datos.setdefault("id_adulto", body.id_usuario)
    datos.setdefault("tipo", "alerta_familiar")

    rol_adulto = vinculados.get("rol_adulto_mayor")
    if rol_adulto:
        datos.setdefault("rolAdulto", rol_adulto)

    # Nombre del adulto para sustituir {nombreAdulto} en el push del familiar
    nombre_adulto = obtener_nombre_usuario(body.id_usuario) or "Tu adulto mayor"
    datos.setdefault("nombreAdulto", nombre_adulto)

    titulo_final = (body.titulo or "").replace("{nombreAdulto}", nombre_adulto)
    cuerpo_final = (body.cuerpo or "").replace("{nombreAdulto}", nombre_adulto)

    tokens = _tokens_por_ids(db, familiares_ids)
    resultado = enviar_push_a_tokens(
        tokens, titulo_final, cuerpo_final, datos, channel_id="alertas_familiar"
    )
    resultado["familiares_notificados"] = len(tokens)
    return resultado


@router.post("/notificar/adultos")
def notificar_adultos(
    body: schemas.NotificarVinculadosRequest,
    db: Session = Depends(obtener_sesion),
):
    """Envía notificación de alarma al adulto mayor vinculado al familiar."""
    logger.info(f"[API] POST /notificar/adultos — Id_Familiar: {body.id_usuario}")

    vinculados = obtener_vinculados(body.id_usuario)
    adultos_ids = vinculados.get("adultos_ids", [])

    tokens = _tokens_por_ids(db, adultos_ids)
    resultado = enviar_push_a_tokens(
        tokens, body.titulo, body.cuerpo, body.datos, channel_id="medicamentos_alarma_v2"
    )
    resultado["adultos_notificados"] = len(tokens)
    return resultado
