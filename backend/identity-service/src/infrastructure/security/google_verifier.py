"""
Implementación: Verificador de Tokens de Google
Verifica id_token de Google usando la librería google-auth.
"""
import os
import logging

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from src.domain.models.user import InfoUsuarioGoogle
from src.domain.ports.google_auth_port import GoogleAuthPort

logger = logging.getLogger(__name__)

GOOGLE_WEB_CLIENT_ID = os.getenv(
    "GOOGLE_WEB_CLIENT_ID",
    "238255168182-2k6sgdo7moek39stcpdm4jo4otbpmovl.apps.googleusercontent.com"
)


class GoogleTokenVerifier(GoogleAuthPort):
    """Implementación concreta del puerto de autenticación de Google."""

    def verificar_id_token(self, token: str) -> InfoUsuarioGoogle:
        """
        Verifica el id_token contra los servidores de Google.
        Retorna InfoUsuarioGoogle con los datos del usuario.
        """
        logger.info("[GoogleVerifier] Verificando id_token contra Google...")

        try:
            info = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                GOOGLE_WEB_CLIENT_ID
            )

            # Verificar que el issuer sea correcto
            if info["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
                logger.error(f"[GoogleVerifier] Issuer inválido: {info['iss']}")
                raise ValueError("Token de Google con issuer inválido")

            resultado = InfoUsuarioGoogle(
                Google_Id=info["sub"],
                Correo=info.get("email", ""),
                Nombre=info.get("name", ""),
                Foto=info.get("picture", None),
            )

            logger.info(f"[GoogleVerifier] Token verificado — Correo: {resultado.Correo}")
            return resultado

        except ValueError as e:
            logger.error(f"[GoogleVerifier] Token inválido: {str(e)}")
            raise ValueError(f"Token de Google inválido: {str(e)}")
