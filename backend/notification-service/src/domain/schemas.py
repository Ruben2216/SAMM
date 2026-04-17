"""
Esquemas Pydantic del Notification Service.
"""
from typing import Optional, Any
from pydantic import BaseModel


class GuardarTokenRequest(BaseModel):
    id_usuario: int
    push_token: str
    plataforma: Optional[str] = "expo"


class TokenResponse(BaseModel):
    id_usuario: int
    push_token: str
    plataforma: str

    class Config:
        from_attributes = True


class NotificarUsuariosRequest(BaseModel):
    """Enviar push a una lista específica de IDs de usuarios."""
    ids_usuarios: list[int]
    titulo: str
    cuerpo: str
    datos: Optional[dict[str, Any]] = None


class NotificarVinculadosRequest(BaseModel):
    """Enviar push a los usuarios vinculados al id_usuario (familiares o adultos)."""
    id_usuario: int
    titulo: str
    cuerpo: str
    datos: Optional[dict[str, Any]] = None
