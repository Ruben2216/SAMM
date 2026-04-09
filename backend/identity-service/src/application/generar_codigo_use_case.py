# Generar código de vinculación (genera o retorna el código de vinculación de un familiar (5 caracteres))
import logging
import random
import string

from src.domain.ports.user_repository_port import UserRepositoryPort

logger = logging.getLogger(__name__)


def _generar_codigo_unico(repositorio: UserRepositoryPort) -> str:
    """Genera un código alfanumérico de 5 caracteres que no exista en la BD."""
    caracteres = string.ascii_uppercase + string.digits
    for _ in range(100):  # máximo 100 intentos
        codigo = ''.join(random.choices(caracteres, k=5))
        if not repositorio.buscar_por_codigo_vinculacion(codigo):
            return codigo
    raise ValueError("No se pudo generar un código único")


class GenerarCodigoUseCase:
    """Genera o retorna el código de vinculación de un familiar."""

    def __init__(self, repositorio_usuario: UserRepositoryPort):
        self._repositorio = repositorio_usuario

    def ejecutar(self, id_usuario: int) -> str:
        """
        Si el familiar ya tiene código, lo retorna.
        Si no, genera uno nuevo, lo guarda y lo retorna.
        """
        usuario = self._repositorio.buscar_por_id(id_usuario)
        if not usuario:
            raise ValueError("Usuario no encontrado")

        if usuario.Rol != "familiar":
            raise ValueError("Solo los familiares pueden generar códigos de vinculación")

        # Si ya tiene código, retornarlo
        if usuario.Codigo_Vinculacion:
            logger.info(f"[GenerarCodigo] Retornando código existente para usuario {id_usuario}")
            return usuario.Codigo_Vinculacion

        # Generar código nuevo
        codigo = _generar_codigo_unico(self._repositorio)
        usuario.Codigo_Vinculacion = codigo
        self._repositorio.actualizar(usuario)
        logger.info(f"[GenerarCodigo] Código generado para usuario {id_usuario}: {codigo}")

        return codigo
