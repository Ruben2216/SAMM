"""
Casos de Uso — Capa de Aplicación.

Aquí vive la lógica de negocio pura.
Los casos de uso orquestan los repositorios y servicios
sin conocer detalles de FastAPI, SQLAlchemy ni RabbitMQ.
"""

import logging
from typing import List, Optional
from datetime import datetime, timezone

from src.domain.models.tracking_models import Ubicacion, ConfiguracionRastreo
from src.domain.ports.repositories import (
    IUbicacionRepository,
    IConfiguracionRepository,
    IEventPublisher,
)

logger = logging.getLogger(__name__)


class TrackingUseCases:
    def __init__(
        self,
        ubicacion_repo: IUbicacionRepository,
        config_repo: IConfiguracionRepository,
        event_publisher: IEventPublisher,
    ):
        self._ubicaciones  = ubicacion_repo
        self._configs      = config_repo
        self._publisher    = event_publisher

    # ──────────────────────────────────────────
    # CASO DE USO 1: Recibir y guardar ubicación
    # ──────────────────────────────────────────
    def registrar_ubicacion(
        self,
        id_adulto_mayor:  int,
        latitud:          float,
        longitud:         float,
        precision_metros: Optional[float] = None,
    ) -> Ubicacion:
        # ← ELIMINAMOS la validación de frecuencia.
        # El adulto mayor puede enviar ubicación siempre que quiera,
        # independientemente de si el familiar ya configuró el rastreo.
        nueva_ubicacion = Ubicacion(
            Id_Adulto_Mayor  = id_adulto_mayor,
            Latitud          = latitud,
            Longitud         = longitud,
            Precision_Metros = precision_metros,
            Fecha_Hora       = datetime.now(timezone.utc),
        )
        guardada = self._ubicaciones.guardar(nueva_ubicacion)
        logger.info(f"Ubicación guardada: {id_adulto_mayor} → ({latitud}, {longitud})")

        try:
            self._publisher.publicar_ubicacion(id_adulto_mayor, latitud, longitud)
        except Exception as e:
            logger.error(f"No se pudo publicar evento: {e}")

        return guardada

    # ──────────────────────────────────────────
    # CASO DE USO 2: Consultar ubicaciones
    # ──────────────────────────────────────────
    def obtener_ultimas_ubicaciones(self, id_adulto_mayor: int) -> List[Ubicacion]:
        return self._ubicaciones.obtener_ultimas_por_adulto(id_adulto_mayor)

    def obtener_ultima_ubicacion(self, id_adulto_mayor: int) -> Optional[Ubicacion]:
        return self._ubicaciones.obtener_ultima(id_adulto_mayor)

    # ──────────────────────────────────────────
    # CASO DE USO 3: Configurar rastreo (familiar)
    # ──────────────────────────────────────────
    def configurar_rastreo(
        self,
        id_familiar:        int,
        id_adulto_mayor:    int,
        frecuencia_minutos: int,
    ) -> ConfiguracionRastreo:
        """Crea o actualiza la configuración de frecuencia del familiar."""
        config_existente = self._configs.obtener_por_familiar_y_adulto(id_familiar, id_adulto_mayor)

        if config_existente:
            config_existente.Frecuencia_Minutos  = frecuencia_minutos
            config_existente.Fecha_Actualizacion = datetime.now(timezone.utc)
            return self._configs.crear_o_actualizar(config_existente)
        else:
            nueva_config = ConfiguracionRastreo(
                Id_Familiar         = id_familiar,
                Id_Adulto_Mayor     = id_adulto_mayor,
                Frecuencia_Minutos  = frecuencia_minutos,
                Activo              = False,
                Fecha_Actualizacion = datetime.now(timezone.utc),
            )
            return self._configs.crear_o_actualizar(nueva_config)

    # ──────────────────────────────────────────
    # CASO DE USO 4: Activar / Desactivar rastreo (adulto mayor)
    # ──────────────────────────────────────────
    def toggle_rastreo_adulto_mayor(self, id_adulto_mayor: int, activo: bool) -> dict:
        """
        El adulto mayor enciende o apaga su rastreo desde la app.
        Actualiza TODAS las configuraciones donde aparece ese adulto mayor
        (puede tener más de un familiar configurado).
        """
        afectados = self._configs.activar_desactivar(id_adulto_mayor, activo)
        estado = "activado" if activo else "desactivado"
        logger.info(f"Rastreo {estado} para adulto mayor {id_adulto_mayor}. Configs afectadas: {afectados}")
        return {
            "mensaje": f"Rastreo {estado} correctamente.",
            "id_adulto_mayor": id_adulto_mayor,
            "activo": activo,
            "configs_actualizadas": afectados,
        }

    # ──────────────────────────────────────────
    # CASO DE USO 5: Vista del mapa del familiar
    # ──────────────────────────────────────────
    def obtener_rastreo_completo_familiar(self, id_familiar: int) -> dict:
        """
        Devuelve todas las configuraciones del familiar + la última ubicación
        de cada adulto mayor que tiene configurado.
        Esto alimenta el mapa en la app del familiar.
        """
        configs = self._configs.obtener_todas_por_familiar(id_familiar)
        resultado = []

        for config in configs:
            ultima = self._ubicaciones.obtener_ultima(config.Id_Adulto_Mayor)
            resultado.append({
                "Id_Adulto_Mayor":    config.Id_Adulto_Mayor,
                "Frecuencia_Minutos": config.Frecuencia_Minutos,
                "Activo":             config.Activo,
                "ultima_ubicacion":   ultima,
            })

        return {"Id_Familiar": id_familiar, "adultos_mayores": resultado}

    # ──────────────────────────────────────────
    # CASO DE USO 6: Obtener frecuencia actual
    # (el teléfono del adulto mayor necesita saber cada cuánto enviar)
    # ──────────────────────────────────────────
    def obtener_frecuencia_envio(self, id_adulto_mayor: int) -> Optional[int]:
        return self._configs.obtener_frecuencia(id_adulto_mayor)