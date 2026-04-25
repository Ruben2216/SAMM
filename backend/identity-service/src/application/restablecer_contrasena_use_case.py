"""Caso de Uso: Restablecer Contraseña (JWT sin estado)

Valida el token y actualiza el hash de contraseña aplicando mitigación de un solo uso.
"""
import logging

from src.domain.ports.user_repository_port import UserRepositoryPort
from src.domain.ports.password_hasher_port import PasswordHasherPort
from src.domain.ports.token_service_port import TokenServicePort

logger = logging.getLogger(__name__)


class RestablecerContrasenaUseCase:
    """Caso de uso para restablecer contraseña con un token JWT."""

    def __init__(
        self,
        repositorio_usuario: UserRepositoryPort,
        hasher: PasswordHasherPort,
        servicio_token: TokenServicePort,
    ):
        self._repositorio = repositorio_usuario
        self._hasher = hasher
        self._token = servicio_token

    def ejecutar(self, token: str, nueva_contrasena: str) -> None:
        """Restablece la contraseña.

        - Token inválido/expirado => ValueError("Token inválido o expirado")
        - Token ya usado => ValueError("El token ya fue utilizado")
        """
        logger.info("[ResetPassword] Intentando restablecer contraseña")

        try:
            payload = self._token.verificar_token_recuperacion(token)
        except ValueError:
            raise ValueError("Token inválido o expirado")

        try:
            id_usuario = int(payload["sub"])
            pwd_frag = str(payload["pwd_frag"])
        except Exception:
            raise ValueError("Token inválido o expirado")

        usuario = self._repositorio.buscar_por_id(id_usuario)
        if not usuario:
            raise ValueError("Token inválido o expirado")

        if not usuario.Contrasena_Hash:
            raise ValueError("Token inválido o expirado")

        if usuario.Contrasena_Hash[:12] != pwd_frag:
            raise ValueError("El token ya fue utilizado")

        # Validación de seguridad: limitar tamaño de contraseña en bytes.
        nueva_bytes = nueva_contrasena.encode("utf-8")
        if len(nueva_bytes) > 256:
            raise ValueError(
                "La contraseña recibida es demasiado larga. Verifica que no estés enviando un token u otro texto en el campo contraseña."
            )

        nuevo_hash = self._hasher.hashear(nueva_contrasena)
        usuario.Contrasena_Hash = nuevo_hash
        self._repositorio.actualizar(usuario)

        logger.info(f"[ResetPassword] Contraseña actualizada — Id_Usuario: {id_usuario}")
