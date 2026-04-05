"""Caso de uso: Eliminar avatar del usuario."""

from src.domain.ports.user_repository_port import UserRepositoryPort
from src.domain.ports.avatar_storage_port import AvatarStoragePort


class DeleteAvatarUseCase:
    def __init__(self, repo: UserRepositoryPort, storage: AvatarStoragePort):
        self._repo = repo
        self._storage = storage

    def ejecutar(self, id_usuario: int) -> dict:
        usuario = self._repo.buscar_por_id(id_usuario)
        if not usuario:
            raise ValueError("Usuario no encontrado")

        self._storage.eliminar_avatar(usuario.Id_Usuario)
        usuario.url_Avatar = None

        usuario_actualizado = self._repo.actualizar(usuario)
        return {"usuario": usuario_actualizado}
