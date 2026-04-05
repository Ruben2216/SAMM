"""Storage local de avatares.

Implementación pensada para desarrollo y despliegues simples.
En producción se puede reemplazar por un adaptador S3/GCS/Azure sin tocar casos de uso.
"""

import os
from typing import Iterable

from src.domain.ports.avatar_storage_port import AvatarStoragePort


class LocalAvatarStorage(AvatarStoragePort):
    def __init__(self, directorio_base: str):
        self._directorio_base = directorio_base

    def _directorio_avatars(self) -> str:
        return os.path.join(self._directorio_base, "avatars")

    def _asegurar_directorios(self) -> None:
        os.makedirs(self._directorio_avatars(), exist_ok=True)

    def _extensiones_conocidas(self) -> Iterable[str]:
        return (".jpg", ".jpeg", ".png", ".webp")

    def _ruta_archivo(self, id_usuario: int, extension: str) -> str:
        nombre_archivo = f"avatar_{id_usuario}{extension}"
        return os.path.join(self._directorio_avatars(), nombre_archivo)

    def guardar_avatar(self, id_usuario: int, contenido: bytes, extension: str) -> str:
        self._asegurar_directorios()

        extension_normalizada = extension.lower().strip()
        if not extension_normalizada.startswith("."):
            extension_normalizada = f".{extension_normalizada}"

        self.eliminar_avatar(id_usuario)

        ruta_archivo = self._ruta_archivo(id_usuario, extension_normalizada)
        with open(ruta_archivo, "wb") as archivo:
            archivo.write(contenido)

        nombre_archivo = os.path.basename(ruta_archivo)
        return f"/media/avatars/{nombre_archivo}"

    def eliminar_avatar(self, id_usuario: int) -> None:
        self._asegurar_directorios()

        for extension in self._extensiones_conocidas():
            ruta = self._ruta_archivo(id_usuario, extension)
            try:
                if os.path.exists(ruta):
                    os.remove(ruta)
            except OSError:
                # Si falla por permisos o locks, preferimos no romper el flujo.
                pass
