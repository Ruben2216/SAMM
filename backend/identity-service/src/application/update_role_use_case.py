"""
Caso de Uso: Asignar Rol al Usuario
Se usa después del primer login con Google cuando el usuario aún no tiene rol.
"""
import logging

from src.domain.models.user import Usuario
from src.domain.ports.user_repository_port import UserRepositoryPort
from src.domain.ports.token_service_port import TokenServicePort

logger = logging.getLogger(__name__)


class UpdateRoleUseCase:
    """Caso de uso para asignar rol a un usuario nuevo."""

    def __init__(
        self,
        repositorio_usuario: UserRepositoryPort,
        servicio_token: TokenServicePort,
    ):
        self._repositorio = repositorio_usuario
        self._token = servicio_token

    def ejecutar(self, id_usuario: int, rol: str) -> dict:
        """
        Flujo:
        1. Busca al usuario por ID.
        2. Valida que el rol sea correcto.
        3. Actualiza el rol.
        4. Genera un nuevo JWT con el rol incluido.
        """
        logger.info(f"[AsignarRol] Asignando rol '{rol}' a Id_Usuario: {id_usuario}")

        if rol not in ("familiar", "adulto_mayor"):
            logger.warning(f"[AsignarRol] Rol inválido — {rol}")
            raise ValueError("El rol debe ser 'familiar' o 'adulto_mayor'")

        usuario = self._repositorio.buscar_por_id(id_usuario)
        if not usuario:
            logger.warning(f"[AsignarRol] Usuario no encontrado — Id_Usuario: {id_usuario}")
            raise ValueError("Usuario no encontrado")

        usuario.Rol = rol
        usuario = self._repositorio.actualizar(usuario)
        logger.info(f"[AsignarRol] Rol actualizado exitosamente — Id_Usuario: {id_usuario}, Rol: {rol}")

        # Generar nuevo JWT con el rol incluido
        nuevo_token = self._token.crear_token(usuario.Id_Usuario, usuario.Rol)
        logger.info(f"[AsignarRol] Nuevo JWT generado con rol '{rol}'")

        return {
            "token_sesion": nuevo_token,
            "usuario": usuario,
        }
