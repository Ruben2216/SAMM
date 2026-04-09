# Validar código de vinculación (el adulto mayor ingresa el código que le dio el familiar para vincularse)
import logging

from src.domain.models.vinculacion import Vinculacion
from src.domain.ports.user_repository_port import UserRepositoryPort
from src.domain.ports.vinculacion_repository_port import VinculacionRepositoryPort

logger = logging.getLogger(__name__)


class ValidarCodigoUseCase:
    """Valida un código de vinculación y crea el enlace familiar-adulto mayor."""

    def __init__(
        self,
        repositorio_usuario: UserRepositoryPort,
        repositorio_vinculacion: VinculacionRepositoryPort,
    ):
        self._repo_usuario = repositorio_usuario
        self._repo_vinculacion = repositorio_vinculacion

    def ejecutar(self, id_adulto_mayor: int, codigo: str) -> Vinculacion:
        """
        Flujo:
        1. Verifica que el usuario sea adulto_mayor.
        2. Busca al familiar por código.
        3. Verifica que no exista vinculación duplicada.
        4. Crea la vinculación.
        """
        logger.info(f"[ValidarCodigo] Adulto {id_adulto_mayor} intenta vincular con código: {codigo}")

        # Verificar que es adulto mayor
        adulto = self._repo_usuario.buscar_por_id(id_adulto_mayor)
        if not adulto:
            raise ValueError("Usuario no encontrado")
        if adulto.Rol != "adulto_mayor":
            raise ValueError("Solo los adultos mayores pueden usar códigos de vinculación")

        # Buscar familiar por código
        familiar = self._repo_usuario.buscar_por_codigo_vinculacion(codigo.upper())
        if not familiar:
            raise ValueError("Código de vinculación inválido")

        # Verificar que no estén ya vinculados
        if self._repo_vinculacion.existe_vinculacion(familiar.Id_Usuario, id_adulto_mayor):
            raise ValueError("Ya estás vinculado con este familiar")

        # Crear vinculación
        vinculacion = Vinculacion(
            Id_Familiar=familiar.Id_Usuario,
            Id_Adulto_Mayor=id_adulto_mayor,
        )
        vinculacion = self._repo_vinculacion.guardar(vinculacion)
        logger.info(f"[ValidarCodigo] Vinculación creada — Id: {vinculacion.Id_Vinculacion}")

        return vinculacion
