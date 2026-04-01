from pydantic import BaseModel
from typing import List
from datetime import time, datetime

# 1. Esquema para los horarios (lo que recibimos)
class HorarioCreate(BaseModel):
    Hora_Toma: time

# 2. Esquema para los horarios (lo que respondemos)
class HorarioResponse(HorarioCreate):
    Id_Horario: int
    
    class Config:
        from_attributes = True

# 3. Esquema para CREAR un Medicamento
class MedicamentoCreate(BaseModel):
    Id_Usuario: int
    Nombre: str
    Dosis: str
    Frecuencia: str
    horarios: List[HorarioCreate] 

# 4. Esquema de RESPUESTA (Lo que le devolvemos a la app)
class MedicamentoResponse(BaseModel):
    Id_Medicamento: int
    Id_Usuario: int
    Nombre: str
    Dosis: str
    Frecuencia: str
    Activo: bool
    horarios: List[HorarioResponse] = []

    class Config:
        from_attributes = True