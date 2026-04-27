from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


# ──────────────────────────────────────────────
# SCHEMAS DE UBICACIÓN
# ──────────────────────────────────────────────

class UbicacionCreate(BaseModel):
    """Lo que envía el teléfono del adulto mayor."""
    Id_Adulto_Mayor:  int
    Latitud:          Decimal = Field(..., ge=-90,  le=90)
    Longitud:         Decimal = Field(..., ge=-180, le=180)
    Precision_Metros: Optional[Decimal] = None


class UbicacionResponse(BaseModel):
    """Lo que devolvemos al familiar."""
    Id_Ubicacion:     int
    Id_Adulto_Mayor:  int
    Latitud:          Decimal
    Longitud:         Decimal
    Fecha_Hora:       datetime
    Precision_Metros: Optional[Decimal] = None

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# SCHEMAS DE CONFIGURACIÓN DE RASTREO
# ──────────────────────────────────────────────

class ConfiguracionCreate(BaseModel):
    """
    Cuando el familiar crea o actualiza la configuración de rastreo
    para UN adulto mayor específico.
    """
    Id_Familiar:        int
    Id_Adulto_Mayor:    int
    Frecuencia_Minutos: int = Field(default=10, ge=1, le=1440)  # entre 1 min y 24h


class ConfiguracionUpdate(BaseModel):
    """Para actualizar solo la frecuencia o el estado activo."""
    Frecuencia_Minutos: Optional[int] = Field(default=None, ge=1, le=1440)
    Activo:             Optional[bool] = None


class ConfiguracionResponse(BaseModel):
    Id_Config:           int
    Id_Familiar:         int
    Id_Adulto_Mayor:     int
    Frecuencia_Minutos:  int
    Activo:              bool
    Fecha_Actualizacion: datetime

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# SCHEMA COMPUESTO: familiar ve todos sus adultos mayores
# ──────────────────────────────────────────────

class AdultoMayorConUbicacion(BaseModel):
    """
    Vista consolidada para el mapa del familiar:
    configuración + última ubicación conocida de un adulto mayor.
    """
    Id_Adulto_Mayor:    int
    Frecuencia_Minutos: int
    Activo:             bool
    ultima_ubicacion:   Optional[UbicacionResponse] = None


class RastreoFamiliarResponse(BaseModel):
    """Lista de todos los adultos mayores que un familiar está monitoreando."""
    Id_Familiar:    int
    adultos_mayores: List[AdultoMayorConUbicacion]


# ──────────────────────────────────────────────
# SCHEMA PARA ACTIVAR / DESACTIVAR RASTREO
# (acción del adulto mayor en su teléfono)
# ──────────────────────────────────────────────

class ToggleRastreoRequest(BaseModel):
    """El adulto mayor enciende o apaga su rastreo."""
    Id_Adulto_Mayor: int
    Activo:          bool