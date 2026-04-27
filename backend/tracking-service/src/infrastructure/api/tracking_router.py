"""
VERSIÓN ACTUALIZADA DE:
tracking-service/src/infrastructure/api/tracking_router.py

Cambio aplicado: el endpoint GET /rastreo/familiar/{id}/mapa
ahora serializa correctamente Latitud, Longitud y Fecha_Hora
para que el frontend pueda parsearlo sin errores de tipo.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from decimal import Decimal
from datetime import datetime

from src.domain.models.schemas import (
    UbicacionCreate,
    UbicacionResponse,
    ConfiguracionCreate,
    ConfiguracionUpdate,
    ConfiguracionResponse,
    RastreoFamiliarResponse,
    ToggleRastreoRequest,
)
from src.application.tracking_service import TrackingUseCases
from src.infrastructure.services.dependencies import get_tracking_use_cases

router = APIRouter(prefix="/rastreo", tags=["Rastreo"])


# ──────────────────────────────────────────────────────────────
# ENDPOINTS DEL ADULTO MAYOR
# ──────────────────────────────────────────────────────────────

@router.post("/ubicacion", response_model=UbicacionResponse, status_code=201)
def enviar_ubicacion(
    payload:   UbicacionCreate,
    use_cases: TrackingUseCases = Depends(get_tracking_use_cases),
):
    """
    El teléfono del adulto mayor envía su coordenada actual.
    Llamado periódicamente por la tarea en segundo plano (expo-location / TaskManager).
    """
    try:
        ubicacion = use_cases.registrar_ubicacion(
            id_adulto_mayor  = payload.Id_Adulto_Mayor,
            latitud          = float(payload.Latitud),
            longitud         = float(payload.Longitud),
            precision_metros = float(payload.Precision_Metros) if payload.Precision_Metros else None,
        )
        return ubicacion
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/toggle", status_code=200)
def activar_desactivar_rastreo(
    payload:   ToggleRastreoRequest,
    use_cases: TrackingUseCases = Depends(get_tracking_use_cases),
):
    """
    El adulto mayor activa o desactiva su rastreo.
    El locationService.ts del frontend llama a este endpoint cuando cambia el switch.
    """
    resultado = use_cases.toggle_rastreo_adulto_mayor(
        id_adulto_mayor = payload.Id_Adulto_Mayor,
        activo          = payload.Activo,
    )
    return resultado


@router.get("/adulto/{id_adulto_mayor}/frecuencia", status_code=200)
def obtener_frecuencia_envio(
    id_adulto_mayor: int,
    use_cases: TrackingUseCases = Depends(get_tracking_use_cases),
):
    """
    El locationService.ts consulta esta frecuencia al activar el rastreo
    para programar el intervalo de la tarea en segundo plano.
    """
    frecuencia = use_cases.obtener_frecuencia_envio(id_adulto_mayor)
    if frecuencia is None:
        raise HTTPException(
            status_code=404,
            detail="No hay configuración de rastreo activa para este adulto mayor."
        )
    return {"id_adulto_mayor": id_adulto_mayor, "frecuencia_minutos": frecuencia}


@router.get("/adulto/{id_adulto_mayor}/ubicaciones", response_model=List[UbicacionResponse])
def obtener_ubicaciones_adulto(
    id_adulto_mayor: int,
    use_cases: TrackingUseCases = Depends(get_tracking_use_cases),
):
    """Devuelve las últimas ubicaciones (máx. 4) del adulto mayor."""
    return use_cases.obtener_ultimas_ubicaciones(id_adulto_mayor)


# ──────────────────────────────────────────────────────────────
# ENDPOINTS DEL FAMILIAR
# ──────────────────────────────────────────────────────────────

@router.post("/configuracion", response_model=ConfiguracionResponse, status_code=201)
def configurar_rastreo(
    payload:   ConfiguracionCreate,
    use_cases: TrackingUseCases = Depends(get_tracking_use_cases),
):
    """
    El familiar configura la frecuencia con la que quiere recibir
    la ubicación de un adulto mayor específico.
    """
    config = use_cases.configurar_rastreo(
        id_familiar        = payload.Id_Familiar,
        id_adulto_mayor    = payload.Id_Adulto_Mayor,
        frecuencia_minutos = payload.Frecuencia_Minutos,
    )
    return config


@router.get("/familiar/{id_familiar}/mapa")
def obtener_mapa_familiar(
    id_familiar: int,
    use_cases:   TrackingUseCases = Depends(get_tracking_use_cases),
):
    """
    Vista consolidada para el mapa del familiar.
    Devuelve todos sus adultos mayores con la última ubicación de cada uno.

    El reportService.ts del frontend consume este endpoint.

    CAMBIO RESPECTO A LA VERSIÓN ANTERIOR:
    Se serializa manualmente la respuesta para que Decimal y datetime
    sean compatibles con JSON sin errores de tipo en el frontend.
    """
    datos = use_cases.obtener_rastreo_completo_familiar(id_familiar)

    adultos_serializados = []
    for adulto in datos["adultos_mayores"]:
        ultima = adulto.get("ultima_ubicacion")

        ultima_serializada = None
        if ultima:
            ultima_serializada = {
                "Id_Ubicacion":     ultima.Id_Ubicacion,
                "Id_Adulto_Mayor":  ultima.Id_Adulto_Mayor,
                "Latitud":          float(ultima.Latitud),
                "Longitud":         float(ultima.Longitud),
                "Fecha_Hora":       ultima.Fecha_Hora.isoformat() if isinstance(ultima.Fecha_Hora, datetime) else str(ultima.Fecha_Hora),
                "Precision_Metros": float(ultima.Precision_Metros) if ultima.Precision_Metros else None,
            }

        adultos_serializados.append({
            "Id_Adulto_Mayor":    adulto["Id_Adulto_Mayor"],
            "Frecuencia_Minutos": adulto["Frecuencia_Minutos"],
            "Activo":             adulto["Activo"],
            "ultima_ubicacion":   ultima_serializada,
        })

    return {
        "Id_Familiar":    id_familiar,
        "adultos_mayores": adultos_serializados,
    }


@router.get("/familiar/{id_familiar}/adulto/{id_adulto_mayor}", response_model=ConfiguracionResponse)
def obtener_configuracion_especifica(
    id_familiar:     int,
    id_adulto_mayor: int,
    use_cases: TrackingUseCases = Depends(get_tracking_use_cases),
):
    """Devuelve la configuración de rastreo de un familiar para un adulto mayor."""
    config = use_cases._configs.obtener_por_familiar_y_adulto(id_familiar, id_adulto_mayor)
    if not config:
        raise HTTPException(status_code=404, detail="Configuración no encontrada.")
    return config