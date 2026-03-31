"""
Caso de Uso: Registro de Usuario (Manual)
Crea un nuevo usuario con correo y contraseña hasheada.
"""
import logging
import re
from dataclasses import dataclass

from src.domain.models.user import Usuario
from src.domain.ports.user_repository_port import UserRepositoryPort
from src.domain.ports.password_hasher_port import PasswordHasherPort
from src.domain.ports.token_service_port import TokenServicePort

logger = logging.getLogger(__name__)


@dataclass
class ResultadoRegistro:
    """Resultado del caso de uso de registro."""
    token_sesion: str
    usuario: Usuario


class RegisterUserUseCase:
    """Caso de uso para registrar un usuario nuevo con correo y contraseña."""

    def __init__(
        self,
        repositorio_usuario: UserRepositoryPort,
        hasher: PasswordHasherPort,
        servicio_token: TokenServicePort,
    ):
        self._repositorio = repositorio_usuario
        self._hasher = hasher
        self._token = servicio_token

    def ejecutar(
        self, nombre: str, correo: str, contrasena: str, rol: str
    ) -> ResultadoRegistro:
        """
        Flujo:
        1. Valida que el correo sea de Gmail.
        2. Verifica que no exista un usuario con ese correo.
        3. Hashea la contraseña.
        4. Crea el usuario.
        5. Genera JWT de sesión.
        """
        logger.info(f"[Registro] Intentando registro — Nombre: {nombre}, Correo: {correo}, Rol: {rol}")

        # Validar correo Gmail
        if not re.match(r'^[a-zA-Z0-9._%+-]+@gmail\.com$', correo, re.IGNORECASE):
            logger.warning(f"[Registro] Correo no es Gmail — {correo}")
            raise ValueError("Solo se permiten correos de Gmail (@gmail.com)")

        # Validar que el rol sea válido
        if rol not in ("familiar", "adulto_mayor"):
            logger.warning(f"[Registro] Rol inválido — {rol}")
            raise ValueError("El rol debe ser 'familiar' o 'adulto_mayor'")

        # Verificar duplicados
        existente = self._repositorio.buscar_por_correo(correo)
        if existente:
            logger.warning(f"[Registro] Correo ya registrado — {correo}")
            raise ValueError("Ya existe una cuenta con este correo")

        # Hashear contraseña
        contrasena_hash = self._hasher.hashear(contrasena)
        logger.info("[Registro] Contraseña hasheada exitosamente")

        # Crear usuario
        usuario = Usuario(
            Nombre=nombre,
            Correo=correo,
            Contrasena_Hash=contrasena_hash,
            Proveedor_Auth="local",
            Rol=rol,
        )
        usuario = self._repositorio.guardar(usuario)
        logger.info(f"[Registro] Usuario creado — Id_Usuario: {usuario.Id_Usuario}")

        token_sesion = self._token.crear_token(usuario.Id_Usuario, usuario.Rol)
        logger.info(f"[Registro] JWT generado — Rol: {usuario.Rol}")

        return ResultadoRegistro(
            token_sesion=token_sesion,
            usuario=usuario,
        )
