from pydantic import BaseModel
from typing import List
from datetime import time, date, datetime

# 1. Esquema para los horarios (lo que recibimos)
class HorarioCreate(BaseModel):
    Hora_Toma: time
    # CSV de isoweekday: "1,2,3,4,5,6,7" (Lun..Dom). Default = todos los días.
    Dias_Semana: str = "1,2,3,4,5,6,7"

# 2. Esquema para los horarios (lo que respondemos)
class HorarioResponse(HorarioCreate):
    Id_Horario: int
    # Estado calculado para HOY: pendiente, tomado, incumplido, no_aplica_hoy
    estado_hoy: str = "pendiente"

    class Config:
        from_attributes = True

# 3. Esquema para responder con el historial completo
class HistorialTomaResponse(BaseModel):
    Id_Historial: int
    Id_Medicamento: int
    Nombre_Medicamento: str
    Dosis: str
    Frecuencia: str
    Fecha_Asignada: date
    Hora_Asignada: time
    Estado: str
    Notas: str | None = None

    class Config:
        from_attributes = True

# 4. Esquema para CREAR un Medicamento
class MedicamentoCreate(BaseModel):
    Id_Usuario: int
    Nombre: str
    Dosis: str
    Frecuencia: str
    Notas: str | None = None
    horarios: List[HorarioCreate] 

# 5. Esquema de RESPUESTA (Lo que le devolvemos a la app)
class MedicamentoResponse(BaseModel):
    Id_Medicamento: int
    Id_Usuario: int
    Nombre: str
    Dosis: str
    Frecuencia: str
    Notas: str | None = None
    Activo: bool
    horarios: List[HorarioResponse] = []
    tomado_hoy: bool = False 

    class Config:
        from_attributes = True

# 6. Esquema para confirmar la toma (con la hora exacta)
class TomaConfirmar(BaseModel):
    hora_asignada: time

# 7. Esquema para ACTUALIZAR el perfil de salud
class PerfilSaludUpdate(BaseModel):
    Tipo_Sangre: str | None = None
    Alergias: str | None = None
    Peso: str | None = None
    Edad: int | None = None
    Condicion_Medica: str | None = None
    Telefono: str | None = None

# 8. Esquema de RESPUESTA del perfil de salud
class PerfilSaludResponse(BaseModel):
    Id_Perfil: int | None = None
    Id_Usuario: int
    Tipo_Sangre: str | None = None
    Alergias: str | None = None
    Peso: str | None = None
    Edad: int | None = None
    Condicion_Medica: str | None = None
    Telefono: str | None = None

    class Config:
        from_attributes = True