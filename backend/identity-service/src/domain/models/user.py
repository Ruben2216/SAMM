"""
Entidad de dominio: Usuario
Representación pura del usuario en el negocio, sin dependencias de infraestructura.
"""
from dataclasses import dataclass, field
from datetime import date
from typing import Optional


@dataclass
class Usuario:
    """Entidad principal del dominio de identidad."""
    Id_Usuario: Optional[int] = None        # SERIAL autoincremental
    Nombre: str = ""
    Correo: str = ""                        # Debe ser @gmail.com
    Contrasena_Hash: Optional[str] = None   # None si Proveedor_Auth='google'
    Proveedor_Auth: str = "local"           # 'local' | 'google'
    Google_Id: Optional[str] = None         # ID único de Google
    url_Avatar: Optional[str] = None        # URL/ruta del avatar del usuario
    Rol: Optional[str] = None              # 'familiar' | 'adulto_mayor' | None
    Activo: bool = True
    Fecha_Registro: date = field(default_factory=date.today)

    def es_nuevo(self) -> bool:
        """Un usuario es nuevo si aún no tiene rol asignado."""
        return self.Rol is None

    def es_google(self) -> bool:
        """Verifica si el usuario se autenticó con Google."""
        return self.Proveedor_Auth == "google"


@dataclass
class InfoUsuarioGoogle:
    """Datos extraídos del id_token de Google tras verificación."""
    Google_Id: str
    Correo: str
    Nombre: str
    Foto: Optional[str] = None
