"""
Router: Autenticación — FastAPI
Endpoints para Google Auth, Login Manual, Registro y gestión de sesión.
"""
import logging

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal

from src.domain.models.user import Usuario
from src.application.google_login_use_case import GoogleLoginUseCase
from src.application.login_user_use_case import LoginUserUseCase
from src.application.register_user_use_case import RegisterUserUseCase
from src.application.update_role_use_case import UpdateRoleUseCase
from src.application.solicitar_recuperacion_use_case import SolicitarRecuperacionUseCase
from src.application.restablecer_contrasena_use_case import RestablecerContrasenaUseCase
from src.infrastructure.api.dependencies import (
    obtener_google_login_uc,
    obtener_login_uc,
    obtener_registro_uc,
    obtener_actualizar_rol_uc,
    obtener_solicitar_recuperacion_uc,
    obtener_restablecer_contrasena_uc,
    obtener_usuario_actual,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Autenticación"])


# ===================== Schemas (DTOs) =====================

class GoogleLoginRequest(BaseModel):
    """Body para POST /auth/google"""
    id_token: str


class LoginRequest(BaseModel):
    """Body para POST /auth/login"""
    correo: str
    contrasena: str


class RegisterRequest(BaseModel):
    """Body para POST /auth/register"""
    nombre: str
    correo: str
    contrasena: str
    rol: str  # 'familiar' | 'adulto_mayor'
    sexo: Literal['Hombre', 'Mujer', 'Otro'] = 'Otro'


class UpdateRoleRequest(BaseModel):
    """Body para PUT /auth/rol"""
    rol: str  # 'familiar' | 'adulto_mayor'


class UsuarioResponse(BaseModel):
    """Respuesta con datos del usuario."""
    Id_Usuario: int
    Nombre: str
    Correo: str
    Proveedor_Auth: str
    url_Avatar: Optional[str] = None
    Rol: Optional[str]
    Codigo_Vinculacion: Optional[str] = None
    sexo: str = 'Otro'
    Activo: bool

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Respuesta estándar de autenticación."""
    token_sesion: str
    usuario: UsuarioResponse
    es_nuevo: bool = False


class ForgotPasswordRequest(BaseModel):
    """Body para POST /auth/forgot-password"""

    correo: EmailStr


class ResetPasswordRequest(BaseModel):
    """Body para POST /auth/reset-password"""

    token: str
    nueva_contrasena: str = Field(min_length=8)


class MensajeResponse(BaseModel):
    """Respuesta estándar de mensajes."""

    mensaje: str


# ===================== Endpoints =====================

@router.post("/google", response_model=AuthResponse)
def login_con_google(
    body: GoogleLoginRequest,
    caso_uso: GoogleLoginUseCase = Depends(obtener_google_login_uc),
):
    """
    Inicio de sesión con Google.
    Recibe el id_token de Google del frontend y retorna JWT de sesión.
    """
    logger.info("[API] POST /auth/google — Recibido id_token")

    try:
        resultado = caso_uso.ejecutar(body.id_token)

        logger.info(f"[API] Google login exitoso — es_nuevo: {resultado.es_nuevo}")

        return AuthResponse(
            token_sesion=resultado.token_sesion,
            usuario=UsuarioResponse(
                Id_Usuario=resultado.usuario.Id_Usuario,
                Nombre=resultado.usuario.Nombre,
                Correo=resultado.usuario.Correo,
                Proveedor_Auth=resultado.usuario.Proveedor_Auth,
                url_Avatar=getattr(resultado.usuario, "url_Avatar", None),
                Rol=resultado.usuario.Rol,
                Codigo_Vinculacion=resultado.usuario.Codigo_Vinculacion,
                sexo=getattr(resultado.usuario, "sexo", "Otro") or "Otro",
                Activo=resultado.usuario.Activo,
            ),
            es_nuevo=resultado.es_nuevo,
        )
    except ValueError as e:
        logger.error(f"[API] Error en Google login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.post("/login", response_model=AuthResponse)
def login_manual(
    body: LoginRequest,
    caso_uso: LoginUserUseCase = Depends(obtener_login_uc),
):
    """
    Inicio de sesión con correo y contraseña.
    """
    logger.info(f"[API] POST /auth/login — Correo: {body.correo}")

    try:
        resultado = caso_uso.ejecutar(body.correo, body.contrasena)

        logger.info(f"[API] Login manual exitoso — Id_Usuario: {resultado.usuario.Id_Usuario}")

        return AuthResponse(
            token_sesion=resultado.token_sesion,
            usuario=UsuarioResponse(
                Id_Usuario=resultado.usuario.Id_Usuario,
                Nombre=resultado.usuario.Nombre,
                Correo=resultado.usuario.Correo,
                Proveedor_Auth=resultado.usuario.Proveedor_Auth,
                url_Avatar=getattr(resultado.usuario, "url_Avatar", None),
                Rol=resultado.usuario.Rol,
                Codigo_Vinculacion=resultado.usuario.Codigo_Vinculacion,
                sexo=getattr(resultado.usuario, "sexo", "Otro") or "Otro",
                Activo=resultado.usuario.Activo,
            ),
            es_nuevo=False,
        )
    except ValueError as e:
        logger.error(f"[API] Error en login manual: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.post("/register", response_model=AuthResponse)
def registrar_usuario(
    body: RegisterRequest,
    caso_uso: RegisterUserUseCase = Depends(obtener_registro_uc),
):
    """
    Registro de nuevo usuario con correo, contraseña y rol.
    Solo permite correos de Gmail.
    """
    logger.info(f"[API] POST /auth/register — Correo: {body.correo}, Rol: {body.rol}")

    try:
        resultado = caso_uso.ejecutar(
            nombre=body.nombre,
            correo=body.correo,
            contrasena=body.contrasena,
            rol=body.rol,
            sexo=body.sexo,
        )

        logger.info(f"[API] Registro exitoso — Id_Usuario: {resultado.usuario.Id_Usuario}")

        return AuthResponse(
            token_sesion=resultado.token_sesion,
            usuario=UsuarioResponse(
                Id_Usuario=resultado.usuario.Id_Usuario,
                Nombre=resultado.usuario.Nombre,
                Correo=resultado.usuario.Correo,
                Proveedor_Auth=resultado.usuario.Proveedor_Auth,
                url_Avatar=getattr(resultado.usuario, "url_Avatar", None),
                Rol=resultado.usuario.Rol,
                Codigo_Vinculacion=resultado.usuario.Codigo_Vinculacion,
                sexo=getattr(resultado.usuario, "sexo", "Otro") or "Otro",
                Activo=resultado.usuario.Activo,
            ),
            es_nuevo=True,
        )
    except ValueError as e:
        logger.error(f"[API] Error en registro: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/rol", response_model=AuthResponse)
def asignar_rol(
    body: UpdateRoleRequest,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    caso_uso: UpdateRoleUseCase = Depends(obtener_actualizar_rol_uc),
):
    """
    Asigna rol a usuario nuevo (después del primer login con Google).
    Requiere JWT en el header Authorization.
    """
    logger.info(f"[API] PUT /auth/rol — Id_Usuario: {usuario_actual.Id_Usuario}, Rol: {body.rol}")

    try:
        resultado = caso_uso.ejecutar(usuario_actual.Id_Usuario, body.rol)

        logger.info(f"[API] Rol asignado exitosamente")

        usuario = resultado["usuario"]
        return AuthResponse(
            token_sesion=resultado["token_sesion"],
            usuario=UsuarioResponse(
                Id_Usuario=usuario.Id_Usuario,
                Nombre=usuario.Nombre,
                Correo=usuario.Correo,
                Proveedor_Auth=usuario.Proveedor_Auth,
                url_Avatar=getattr(usuario, "url_Avatar", None),
                Rol=usuario.Rol,
                Codigo_Vinculacion=usuario.Codigo_Vinculacion,
                sexo=getattr(usuario, "sexo", "Otro") or "Otro",
                Activo=usuario.Activo,
            ),
            es_nuevo=False,
        )
    except ValueError as e:
        logger.error(f"[API] Error asignando rol: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/me", response_model=UsuarioResponse)
def obtener_perfil(
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """
    Retorna los datos del usuario autenticado.
    Requiere JWT en el header Authorization.
    """
    logger.info(f"[API] GET /auth/me — Id_Usuario: {usuario_actual.Id_Usuario}")

    return UsuarioResponse(
        Id_Usuario=usuario_actual.Id_Usuario,
        Nombre=usuario_actual.Nombre,
        Correo=usuario_actual.Correo,
        Proveedor_Auth=usuario_actual.Proveedor_Auth,
        url_Avatar=getattr(usuario_actual, "url_Avatar", None),
        Rol=usuario_actual.Rol,
        Codigo_Vinculacion=usuario_actual.Codigo_Vinculacion,
        sexo=getattr(usuario_actual, "sexo", "Otro") or "Otro",
        Activo=usuario_actual.Activo,
    )


@router.post("/forgot-password", response_model=MensajeResponse)
async def forgot_password(
    body: ForgotPasswordRequest,
    caso_uso: SolicitarRecuperacionUseCase = Depends(obtener_solicitar_recuperacion_uc),
):
    """Solicita recuperación de contraseña.

    Responde 200 siempre para evitar enumeración.
    """
    logger.info(f"[API] POST /auth/forgot-password — Correo: {body.correo}")
    await caso_uso.ejecutar(str(body.correo))
    return MensajeResponse(
        mensaje="Si el correo existe, recibirás un enlace válido por 10 minutos.",
    )


@router.post("/reset-password", response_model=MensajeResponse)
def reset_password(
    body: ResetPasswordRequest,
    caso_uso: RestablecerContrasenaUseCase = Depends(obtener_restablecer_contrasena_uc),
):
    """Restablece la contraseña usando un token de recuperación."""
    logger.info("[API] POST /auth/reset-password")

    try:
        caso_uso.ejecutar(body.token, body.nueva_contrasena)
        return MensajeResponse(mensaje="Contraseña actualizada exitosamente.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ===================== Redirect para Deep Link =====================


@router.get("/redirect-reset")
def redirect_reset(token: str):
    """Redirige al deep link samm://reset-password vía HTTP 302.

    El AndroidManifest.xml tiene el intent filter para scheme=samm,
    así que Android intercepta la redirección y abre la app directamente.
    Un redirect 302 del lado del servidor NO es bloqueado por Chrome
    (a diferencia de window.location.href del lado del cliente).
    """
    logger.info("[API] GET /auth/redirect-reset — Redirigiendo 302 al deep link")
    deep_link = f"samm://reset-password?token={token}"
    return RedirectResponse(url=deep_link, status_code=302)
