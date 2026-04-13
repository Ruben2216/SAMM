from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CitaBase(BaseModel):
    id_usuario: int
    id_usuario_creador: int
    doctor_nombre: str
    especialidad: Optional[str] = None
    fecha_hora: datetime
    ubicacion: Optional[str] = None
    notas: Optional[str] = None
    estado: Optional[str] = "programada"

class CitaCreate(CitaBase):
    pass

class CitaResponse(CitaBase):
    id: int
    class Config:
        from_attributes = True

class CitaUpdate(BaseModel):
    doctor_nombre: Optional[str] = None
    especialidad: Optional[str] = None
    fecha_hora: Optional[datetime] = None
    ubicacion: Optional[str] = None
    notas: Optional[str] = None
    estado: Optional[str] = None