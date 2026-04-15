"""
Caso de Uso: Inicio de Sesión con Google
Orquesta la verificación del token de Google, búsqueda/creación de usuario
y generación de JWT de sesión.
"""
import logging
from dataclasses import dataclass
from typing import Optional

from src.domain.models.user import Usuario
from src.domain.ports.user_repository_port import UserRepositoryPort
from src.domain.ports.google_auth_port import GoogleAuthPort
from src.domain.ports.token_service_port import TokenServicePort

logger = logging.getLogger(__name__)


@dataclass
class ResultadoGoogleLogin:
    """Resultado del caso de uso de login con Google."""
    token_sesion: str
    usuario: Usuario
    es_nuevo: bool


class GoogleLoginUseCase:
    """Caso de uso para iniciar sesión con Google."""

    def __init__(
        self,
        repositorio_usuario: UserRepositoryPort,
        verificador_google: GoogleAuthPort,
        servicio_token: TokenServicePort,
    ):
        self._repositorio = repositorio_usuario
        self._google = verificador_google
        self._token = servicio_token

    def ejecutar(self, id_token: str) -> ResultadoGoogleLogin:
        """
        Flujo:
        1. Verifica el id_token contra Google.
        2. Busca al usuario por Google_Id.
        3. Si no existe, busca por Correo (vinculación automática).
        4. Si no existe en absoluto, crea uno nuevo sin rol.
        5. Genera JWT de sesión.
        """
        logger.info("[GoogleLogin] Verificando id_token contra Google...")
        info_google = self._google.verificar_id_token(id_token)
        logger.info(f"[GoogleLogin] Token verificado — Correo: {info_google.Correo}, Google_Id: {info_google.Google_Id}")

        # Buscar por Google_Id
        usuario = self._repositorio.buscar_por_google_id(info_google.Google_Id)

        if usuario:
            logger.info(f"[GoogleLogin] Usuario existente encontrado por Google_Id — Id_Usuario: {usuario.Id_Usuario}")
            es_nuevo = False
        else:
            # Buscar por Correo (vinculación automática si ya se registró manualmente)
            usuario = self._repositorio.buscar_por_correo(info_google.Correo)

            if usuario:
                logger.info(f"[GoogleLogin] Usuario existente encontrado por Correo — vinculando Google_Id")
                usuario.Google_Id = info_google.Google_Id
                if usuario.Proveedor_Auth == "local":
                    usuario.Proveedor_Auth = "google"
                usuario = self._repositorio.actualizar(usuario)
                es_nuevo = False
            else:
                logger.info("[GoogleLogin] Usuario NO encontrado — creando usuario nuevo")
                usuario = Usuario(
                    Nombre=info_google.Nombre,
                    Correo=info_google.Correo,
                    Proveedor_Auth="google",
                    Google_Id=info_google.Google_Id,
                    Rol=None,  # Sin rol, es nuevo
                    sexo="Otro",
                )
                usuario = self._repositorio.guardar(usuario)
                es_nuevo = True
                logger.info(f"[GoogleLogin] Usuario nuevo creado — Id_Usuario: {usuario.Id_Usuario}")

        token_sesion = self._token.crear_token(usuario.Id_Usuario, usuario.Rol)
        logger.info(f"[GoogleLogin] JWT generado — es_nuevo: {es_nuevo}, Rol: {usuario.Rol}")

        return ResultadoGoogleLogin(
            token_sesion=token_sesion,
            usuario=usuario,
            es_nuevo=es_nuevo,
        )
