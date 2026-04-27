""""# Validar código de vinculación (el adulto mayor ingresa el código que le dio el familiar para vincularse)
import logging

from src.domain.models.vinculacion import Vinculacion
from src.domain.ports.user_repository_port import UserRepositoryPort
from src.domain.ports.vinculacion_repository_port import VinculacionRepositoryPort

logger = logging.getLogger(__name__)


class ValidarCodigoUseCase:
   # Valida un código de vinculación y crea el enlace familiar-adulto mayor.

    def __init__(
        self,
        repositorio_usuario: UserRepositoryPort,
        repositorio_vinculacion: VinculacionRepositoryPort,
    ):
        self._repo_usuario = repositorio_usuario
        self._repo_vinculacion = repositorio_vinculacion

    def ejecutar(self, id_adulto_mayor: int, codigo: str) -> Vinculacion:

      #  Flujo:
       # 1. Verifica que el usuario sea adulto_mayor.
       # 2. Busca al familiar por código.
        #3. Verifica que no exista vinculación duplicada.
        #4. Crea la vinculación.

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
"""
"""
backend/identity-service/src/application/validar_codigo_use_case.py

MODIFICADO: después de crear la vinculación, notifica al tracking-service
para crear automáticamente la Configuracion_Rastreo.
Así el familiar NO necesita configurar manualmente el rastreo.
"""
import logging
import os
import requests

from src.domain.models.vinculacion import Vinculacion
from src.domain.ports.user_repository_port import UserRepositoryPort
from src.domain.ports.vinculacion_repository_port import VinculacionRepositoryPort

logger = logging.getLogger(__name__)

# URL del tracking-service. Se lee del .env del identity-service.
TRACKING_SERVICE_URL = os.getenv("TRACKING_SERVICE_URL", "http://localhost:8006")

# Frecuencia por defecto al crear la vinculación (en minutos).
# El familiar puede cambiarla después desde su pantalla de configuración.
FRECUENCIA_DEFAULT_MINUTOS = 5


def _crear_configuracion_rastreo(id_familiar: int, id_adulto_mayor: int) -> None:
    """
    Llama al tracking-service para crear la Configuracion_Rastreo
    entre el familiar y el adulto mayor recién vinculados.

    Si el tracking-service no está disponible, solo se registra el error
    y NO se interrumpe la vinculación — es una operación secundaria.
    """
    url = f"{TRACKING_SERVICE_URL}/rastreo/configuracion"
    payload = {
        "Id_Familiar":        id_familiar,
        "Id_Adulto_Mayor":    id_adulto_mayor,
        "Frecuencia_Minutos": FRECUENCIA_DEFAULT_MINUTOS,
    }

    try:
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code in (200, 201):
            logger.info(
                f"[ValidarCodigo] Configuracion_Rastreo creada automáticamente — "
                f"Familiar: {id_familiar}, Adulto: {id_adulto_mayor}"
            )
        else:
            logger.warning(
                f"[ValidarCodigo] tracking-service respondió {response.status_code}: {response.text}"
            )
    except requests.exceptions.ConnectionError:
        logger.warning(
            "[ValidarCodigo] tracking-service no disponible. "
            "Configuracion_Rastreo no creada — el familiar deberá configurar el rastreo manualmente."
        )
    except requests.exceptions.Timeout:
        logger.warning("[ValidarCodigo] Timeout conectando al tracking-service.")
    except Exception as e:
        logger.error(f"[ValidarCodigo] Error inesperado llamando al tracking-service: {e}")


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
        4. Crea la vinculación en identity-service.
        5. ← NUEVO: Notifica al tracking-service para crear Configuracion_Rastreo.
        """
        logger.info(f"[ValidarCodigo] Adulto {id_adulto_mayor} intenta vincular con código: {codigo}")

        # 1. Verificar que es adulto mayor
        adulto = self._repo_usuario.buscar_por_id(id_adulto_mayor)
        if not adulto:
            raise ValueError("Usuario no encontrado")
        if adulto.Rol != "adulto_mayor":
            raise ValueError("Solo los adultos mayores pueden usar códigos de vinculación")

        # 2. Buscar familiar por código
        familiar = self._repo_usuario.buscar_por_codigo_vinculacion(codigo.upper())
        if not familiar:
            raise ValueError("Código de vinculación inválido")

        # 3. Verificar que no estén ya vinculados
        if self._repo_vinculacion.existe_vinculacion(familiar.Id_Usuario, id_adulto_mayor):
            raise ValueError("Ya estás vinculado con este familiar")

        # 4. Crear vinculación en identity-service
        vinculacion = Vinculacion(
            Id_Familiar=familiar.Id_Usuario,
            Id_Adulto_Mayor=id_adulto_mayor,
        )
        vinculacion = self._repo_vinculacion.guardar(vinculacion)
        logger.info(f"[ValidarCodigo] Vinculación creada — Id: {vinculacion.Id_Vinculacion}")

        # 5. ← NUEVO: Notificar al tracking-service (operación secundaria, no bloquea)
        _crear_configuracion_rastreo(
            id_familiar     = familiar.Id_Usuario,
            id_adulto_mayor = id_adulto_mayor,
        )

        return vinculacion