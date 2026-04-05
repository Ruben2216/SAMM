"""Caso de uso: Actualizar avatar del usuario.

Recibe el avatar en Base64, lo decodifica, lo guarda vía un puerto de storage
y persiste la URL en el usuario.
"""

import base64
import time
from typing import Optional

from src.domain.ports.user_repository_port import UserRepositoryPort
from src.domain.ports.avatar_storage_port import AvatarStoragePort


def _normalizar_extension_desde_mime(mime_type: Optional[str]) -> str:
    if not mime_type:
        return ".jpg"

    mime = mime_type.strip().lower()
    if mime in ("image/jpg", "image/jpeg"):
        return ".jpg"
    if mime == "image/png":
        return ".png"
    if mime == "image/webp":
        return ".webp"

    return ".jpg"


def _decodificar_base64(imagen_base64: str) -> bytes:
    valor = imagen_base64.strip()

    # Soporta strings tipo data URI: data:image/jpeg;base64,XXXX
    if "," in valor and valor.lower().startswith("data:"):
        valor = valor.split(",", 1)[1]

    try:
        return base64.b64decode(valor, validate=False)
    except Exception as exc:
        raise ValueError("Avatar Base64 inválido") from exc


class UpdateAvatarUseCase:
    def __init__(self, repo: UserRepositoryPort, storage: AvatarStoragePort):
        self._repo = repo
        self._storage = storage

    def ejecutar(self, id_usuario: int, imagen_base64: str, mime_type: Optional[str] = None) -> dict:
        usuario = self._repo.buscar_por_id(id_usuario)
        if not usuario:
            raise ValueError("Usuario no encontrado")

        contenido = _decodificar_base64(imagen_base64)
        if not contenido:
            raise ValueError("Avatar vacío")

        # Límite defensivo (en bytes). Ajustable.
        max_bytes = 2 * 1024 * 1024
        if len(contenido) > max_bytes:
            raise ValueError("El avatar excede el tamaño permitido")

        extension = _normalizar_extension_desde_mime(mime_type)
        ruta_publica = self._storage.guardar_avatar(usuario.Id_Usuario, contenido, extension)

        # Evitar caché: query param variable.
        ruta_con_version = f"{ruta_publica}?v={int(time.time())}"
        usuario.url_Avatar = ruta_con_version

        usuario_actualizado = self._repo.actualizar(usuario)
        return {"usuario": usuario_actualizado}
