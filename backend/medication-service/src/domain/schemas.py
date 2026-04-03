from pydantic import BaseModel
from typing import List
from datetime import time, date, datetime

# 1. Esquema para los horarios (lo que recibimos)
class HorarioCreate(BaseModel):
    Hora_Toma: time

# 2. Esquema para los horarios (lo que respondemos)
class HorarioResponse(HorarioCreate):
    Id_Horario: int
    
    class Config:
        from_attributes = True

# 3. Esquema para responder con el historial completo
class HistorialTomaResponse(BaseModel):
    Id_Historial: int
    Id_Medicamento: int
    Nombre_Medicamento: str
    Dosis: str
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