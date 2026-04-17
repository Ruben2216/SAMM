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
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Notifications"])


# --------- Gestión de tokens ---------

@router.put("/push-tokens", response_model=schemas.TokenResponse)
def guardar_token(
    body: schemas.GuardarTokenRequest,
    db: Session = Depends(obtener_sesion),
):
    """Guarda o actualiza el push token de un usuario (upsert por Id_Usuario)."""
    logger.info(f"[API] PUT /push-tokens — Id_Usuario: {body.id_usuario}")

    stmt = insert(PushTokenModel).values(
        Id_Usuario=body.id_usuario,
        Push_Token=body.push_token,
        Plataforma=body.plataforma or "expo",
    )
    stmt = stmt.on_conflict_do_update(
        index_elements=["Id_Usuario"],
        set_={
            "Push_Token": body.push_token,
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


@router.get("/push-tokens/{id_usuario}", response_model=schemas.TokenResponse)
def obtener_token(id_usuario: int, db: Session = Depends(obtener_sesion)):
    """Retorna el token de un usuario específico."""
    registro = db.query(PushTokenModel).filter_by(Id_Usuario=id_usuario).first()
    if not registro:
        raise HTTPException(status_code=404, detail="Token no encontrado")
    return schemas.TokenResponse(
        id_usuario=registro.Id_Usuario,
        push_token=registro.Push_Token,
        plataforma=registro.Plataforma,
    )


@router.delete("/push-tokens/{id_usuario}")
def eliminar_token(id_usuario: int, db: Session = Depends(obtener_sesion)):
    """Elimina el token de un usuario (por ejemplo, al cerrar sesión)."""
    db.query(PushTokenModel).filter_by(Id_Usuario=id_usuario).delete()
    db.commit()
    return {"mensaje": "Token eliminado"}


# --------- Envío de notificaciones ---------

def _tokens_por_ids(db: Session, ids: list[int]) -> list[str]:
    """Retorna la lista de push tokens para los IDs de usuario dados."""
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
    Envía push a todos los familiares vinculados al id_usuario (adulto mayor).
    Flujo: consulta identity-service → obtiene familiares_ids → busca tokens → envía push.
    """
    logger.info(f"[API] POST /notificar/familiares — Id_Adulto: {body.id_usuario}")

    vinculados = obtener_vinculados(body.id_usuario)
    familiares_ids = vinculados.get("familiares_ids", [])

    if not familiares_ids:
        logger.info(f"[API] Adulto {body.id_usuario} no tiene familiares vinculados")
        return {"status": "sin_familiares", "enviados": 0}

    # Enriquecer data con rol_adulto y id_adulto (para que la app sepa a dónde navegar)
    datos = body.datos or {}
    datos.setdefault("id_adulto", body.id_usuario)
    if vinculados.get("rol_adulto_mayor"):
        datos.setdefault("rol_adulto_mayor", vinculados["rol_adulto_mayor"])

    tokens = _tokens_por_ids(db, familiares_ids)
    resultado = enviar_push_a_tokens(tokens, body.titulo, body.cuerpo, datos)
    resultado["familiares_notificados"] = len(tokens)
    return resultado


@router.post("/notificar/adultos")
def notificar_adultos(
    body: schemas.NotificarVinculadosRequest,
    db: Session = Depends(obtener_sesion),
):
    """Envía push a los adultos mayores vinculados a un familiar."""
    logger.info(f"[API] POST /notificar/adultos — Id_Familiar: {body.id_usuario}")

    vinculados = obtener_vinculados(body.id_usuario)
    adultos_ids = vinculados.get("adultos_ids", [])

    tokens = _tokens_por_ids(db, adultos_ids)
    resultado = enviar_push_a_tokens(tokens, body.titulo, body.cuerpo, body.datos)
    resultado["adultos_notificados"] = len(tokens)
    return resultado
