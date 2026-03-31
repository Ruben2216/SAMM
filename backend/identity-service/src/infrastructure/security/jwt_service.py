"""
Implementación: Servicio de Tokens JWT
Genera y verifica tokens JWT usando python-jose.
"""
import os
import logging
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt, JWTError

from src.domain.ports.token_service_port import TokenServicePort

logger = logging.getLogger(__name__)

# Configuración del JWT
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "samm-secret-key-cambiar-en-produccion")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))


class JWTService(TokenServicePort):
    """Implementación concreta del servicio de tokens JWT."""

    def crear_token(self, id_usuario: int, rol: Optional[str]) -> str:
        """Genera un JWT de sesión con Id_Usuario y Rol."""
        logger.info(f"[JWT] Generando token — Id_Usuario: {id_usuario}, Rol: {rol}")

        payload = {
            "sub": str(id_usuario),
            "rol": rol,
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
            "iat": datetime.utcnow(),
        }

        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        logger.info(f"[JWT] Token generado exitosamente (expira en {JWT_EXPIRATION_HOURS}h)")
        return token

    def verificar_token(self, token: str) -> dict:
        """Verifica y decodifica un JWT. Retorna el payload."""
        logger.info("[JWT] Verificando token...")

        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            logger.info(f"[JWT] Token válido — Id_Usuario: {payload.get('sub')}")
            return payload
        except JWTError as e:
            logger.error(f"[JWT] Token inválido: {str(e)}")
            raise ValueError(f"Token de sesión inválido: {str(e)}")
