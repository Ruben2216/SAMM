# Vinculación entre un familiar y un adulto mayor.
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Vinculacion:
    """Vinculación entre un familiar y un adulto mayor."""
    Id_Vinculacion: Optional[int] = None
    Id_Familiar: int = 0
    Id_Adulto_Mayor: int = 0
    Nombre_Circulo: Optional[str] = None
    Rol_Adulto_Mayor: Optional[str] = None
    Fecha_Vinculacion: datetime = field(default_factory=datetime.now)
