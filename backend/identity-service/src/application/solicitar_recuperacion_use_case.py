"""Caso de Uso: Solicitar Recuperación de Contraseña (JWT sin estado)

Envía un correo con un deep link de recuperación válido por 10 minutos.
"""
import logging
from urllib.parse import quote

from src.domain.ports.user_repository_port import UserRepositoryPort
from src.domain.ports.token_service_port import TokenServicePort
from src.domain.ports.email_service_port import EmailServicePort

logger = logging.getLogger(__name__)


class SolicitarRecuperacionUseCase:
    """Caso de uso para solicitar el restablecimiento de contraseña."""

    def __init__(
        self,
        repositorio_usuario: UserRepositoryPort,
        servicio_token: TokenServicePort,
        servicio_email: EmailServicePort,
    ):
        self._repositorio = repositorio_usuario
        self._token = servicio_token
        self._email = servicio_email

    async def ejecutar(self, correo: str) -> None:
        """Solicita recuperación.

        Regla de seguridad: si el usuario no existe o es Google, no se filtra información.
        """
        correo_normalizado = correo.strip().lower()
        logger.info(f"[Recuperacion] Solicitud recibida — Correo: {correo_normalizado}")

        usuario = self._repositorio.buscar_por_correo(correo_normalizado)
        if not usuario:
            logger.info("[Recuperacion] Usuario no existe — respuesta silenciosa")
            return

        if usuario.Proveedor_Auth == "google":
            logger.info(f"[Recuperacion] Cuenta Google — respuesta silenciosa (Id_Usuario: {usuario.Id_Usuario})")
            return

        if not usuario.Contrasena_Hash:
            logger.warning(
                f"[Recuperacion] Cuenta local sin Contrasena_Hash — omitiendo (Id_Usuario: {usuario.Id_Usuario})"
            )
            return

        pwd_frag = usuario.Contrasena_Hash[:12]
        token = self._token.crear_token_recuperacion(usuario.Id_Usuario, pwd_frag)

        # Enlace profundo al frontend (React Navigation) — token en query param.
        token_url = quote(token, safe="")
        enlace = f"samm://reset-password?token={token_url}"

        try:
            await self._email.enviar_correo_recuperacion(usuario.Correo, enlace)
        except Exception as exc:
            # No lanzamos error para evitar enumeración; se registra para observabilidad.
            logger.error(f"[Recuperacion] Error enviando correo: {exc}")
            return

        logger.info(f"[Recuperacion] Correo enviado (Id_Usuario: {usuario.Id_Usuario})")
