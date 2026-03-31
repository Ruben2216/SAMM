"""
Caso de Uso: Inicio de Sesión Manual (Correo + Contraseña)
Verifica las credenciales del usuario y genera un JWT de sesión.
"""
import logging
from dataclasses import dataclass

from src.domain.models.user import Usuario
from src.domain.ports.user_repository_port import UserRepositoryPort
from src.domain.ports.password_hasher_port import PasswordHasherPort
from src.domain.ports.token_service_port import TokenServicePort

logger = logging.getLogger(__name__)


@dataclass
class ResultadoLogin:
    """Resultado del caso de uso de login manual."""
    token_sesion: str
    usuario: Usuario


class LoginUserUseCase:
    """Caso de uso para iniciar sesión con correo y contraseña."""

    def __init__(
        self,
        repositorio_usuario: UserRepositoryPort,
        hasher: PasswordHasherPort,
        servicio_token: TokenServicePort,
    ):
        self._repositorio = repositorio_usuario
        self._hasher = hasher
        self._token = servicio_token

    def ejecutar(self, correo: str, contrasena: str) -> ResultadoLogin:
        """
        Flujo:
        1. Busca al usuario por correo.
        2. Verifica que la cuenta no sea de Google.
        3. Verifica la contraseña.
        4. Genera JWT de sesión.
        """
        logger.info(f"[Login] Intentando login manual — Correo: {correo}")

        usuario = self._repositorio.buscar_por_correo(correo)
        if not usuario:
            logger.warning(f"[Login] Usuario no encontrado — Correo: {correo}")
            raise ValueError("Correo o contraseña incorrectos")

        if not usuario.Activo:
            logger.warning(f"[Login] Cuenta desactivada — Id_Usuario: {usuario.Id_Usuario}")
            raise ValueError("La cuenta está desactivada")

        if usuario.Proveedor_Auth == "google" and not usuario.Contrasena_Hash:
            logger.warning(f"[Login] Intento de login manual en cuenta de Google — Id_Usuario: {usuario.Id_Usuario}")
            raise ValueError("Esta cuenta usa Google para iniciar sesión. Usa el botón de Google.")

        if not self._hasher.verificar(contrasena, usuario.Contrasena_Hash):
            logger.warning(f"[Login] Contraseña incorrecta — Id_Usuario: {usuario.Id_Usuario}")
            raise ValueError("Correo o contraseña incorrectos")

        token_sesion = self._token.crear_token(usuario.Id_Usuario, usuario.Rol)
        logger.info(f"[Login] Login exitoso — Id_Usuario: {usuario.Id_Usuario}, Rol: {usuario.Rol}")

        return ResultadoLogin(
            token_sesion=token_sesion,
            usuario=usuario,
        )
