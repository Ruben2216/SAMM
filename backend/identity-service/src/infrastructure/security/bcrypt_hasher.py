"""
Implementación: Hasher de Contraseñas
Usa passlib para hashear y verificar contraseñas de forma segura.

Nota:
- Se usa bcrypt_sha256 como esquema preferido para evitar el límite práctico de 72 bytes de bcrypt.
- Se mantiene compatibilidad de verificación con hashes bcrypt ya existentes.
"""
import logging

from passlib.context import CryptContext

from src.domain.ports.password_hasher_port import PasswordHasherPort

logger = logging.getLogger(__name__)

# Contexto de hashing
# bcrypt_sha256: acepta contraseñas largas (pre-hash SHA-256) y luego bcrypt.
# bcrypt: compatibilidad para verificar hashes antiguos almacenados.
contexto_crypt = CryptContext(schemes=["bcrypt_sha256", "bcrypt"], deprecated="auto")


class BcryptHasher(PasswordHasherPort):
    """Implementación concreta del hasher de contraseñas usando bcrypt."""

    def hashear(self, contrasena: str) -> str:
        """Genera un hash bcrypt de la contraseña."""
        logger.info("[Hasher] Hasheando contraseña con bcrypt...")
        return contexto_crypt.hash(contrasena)

    def verificar(self, contrasena_plana: str, contrasena_hash: str) -> bool:
        """Verifica si una contraseña plana coincide con su hash bcrypt."""
        logger.info("[Hasher] Verificando contraseña...")
        resultado = contexto_crypt.verify(contrasena_plana, contrasena_hash)
        logger.info(f"[Hasher] Resultado de verificación: {'correcto' if resultado else 'incorrecto'}")
        return resultado
