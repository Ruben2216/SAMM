"""Adaptador: Servicio de Email SMTP (asíncrono)

Envía correos usando aiosmtplib y una plantilla HTML estática.
"""
import logging
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from src.domain.ports.email_service_port import EmailServicePort

logger = logging.getLogger(__name__)


_HTML_TEMPLATE = """<!DOCTYPE html>
<html lang=\"es\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Recuperación de Contraseña SAMM</title>
    <style>
        body { font-family: sans-serif; background-color: #14ec5c; margin: 0; padding: 0; }
        .container { max-width: 400px; margin: 0 auto; background-color: #ffffff; padding: 24px; }
        .header h1 { color: #2c3e50; text-align: center; font-size: 22px; margin: 0; padding-bottom: 20px; border-bottom: 1px solid #eee; }
        .content { padding: 24px 0; color: #333; font-size: 16px; line-height: 1.5; }
        .alert-box { background-color: #fff3cd; color: #856404; padding: 12px; border-radius: 4px; margin-bottom: 24px; font-size: 14px; font-weight: bold; text-align: center; }
        .btn { background-color: #14ec5c; color: #ffffff; text-decoration: none; padding: 14px; border-radius: 6px; font-weight: bold; display: block; text-align: center; }
        .fallback { margin-top: 16px; font-size: 13px; word-break: break-word; color: #475569; }
        .fallback a { color: #0f766e; }
        .footer { text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; margin-top: 10px; }
    </style>
</head>
<body>
    <div class=\"container\">
        <div class=\"header\"><h1>SAMM</h1></div>
        <div class=\"content\">
            <p>Se ha solicitado el restablecimiento de tu contraseña.</p>
            <div class=\"alert-box\">Este enlace es de un solo uso y expirará en 10 minutos.</div>
            <a href=\"{enlace_https}\" class=\"btn\">Restablecer Contraseña</a>
            <p>Si no solicitaste este cambio, ignora este correo. Tu contraseña actual no cambiará.</p>
        </div>
        <div class=\"footer\"><p>&copy; 2026 SAMM.</p></div>
    </div>
</body>
</html>"""


class SMTPEmailService(EmailServicePort):
    """Implementación SMTP para el envío de correos de recuperación."""

    def __init__(self):
        self._smtp_server = os.getenv("SMTP_SERVER")
        self._smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self._smtp_user = os.getenv("SMTP_USER")
        self._smtp_password = os.getenv("SMTP_PASSWORD")

    def _validar_config(self) -> None:
        if not self._smtp_server or not self._smtp_user or not self._smtp_password:
            raise ValueError(
                "Falta configuración SMTP. Requiere SMTP_SERVER, SMTP_USER y SMTP_PASSWORD (App Password)."
            )

    async def enviar_correo_recuperacion(self, correo: str, enlace: str) -> None:
        self._validar_config()

        asunto = "Recuperación de contraseña — SAMM"

        # ── Construir URL HTTPS que sobrevive filtros de Gmail ──
        # enlace llega como: samm://reset-password?token=XXXX
        base_url = os.getenv("SAMM_PUBLIC_URL")
        if not base_url:
            raise ValueError("Falta la variable de entorno SAMM_PUBLIC_URL en el archivo .env")
        token_param = enlace.split("token=", 1)[-1] if "token=" in enlace else ""
        enlace_https = f"{base_url}/auth/redirect-reset?token={token_param}"

        mensaje = MIMEMultipart("alternative")
        mensaje["From"] = self._smtp_user
        mensaje["To"] = correo
        mensaje["Subject"] = asunto

        texto_plano = (
            "Se ha solicitado el restablecimiento de tu contraseña.\n\n"
            f"Enlace (válido por 10 minutos, un solo uso):\n{enlace_https}\n\n"
            "Si no solicitaste este cambio, ignora este correo."
        )
        html = _HTML_TEMPLATE.replace("{enlace_https}", enlace_https)

        mensaje.attach(MIMEText(texto_plano, "plain", "utf-8"))
        mensaje.attach(MIMEText(html, "html", "utf-8"))

        logger.info(f"[SMTP] Enviando correo de recuperación — Destino: {correo}")

        usar_tls_directo = self._smtp_port == 465

        if usar_tls_directo:
            smtp = aiosmtplib.SMTP(hostname=self._smtp_server, port=self._smtp_port, use_tls=True)
            await smtp.connect()
        else:
            # Para puertos tipo 587 (STARTTLS): aiosmtplib puede iniciar STARTTLS automáticamente.
            # Forzamos STARTTLS en connect() y evitamos llamar starttls() dos veces.
            smtp = aiosmtplib.SMTP(
                hostname=self._smtp_server,
                port=self._smtp_port,
                use_tls=False,
                start_tls=True,
            )
            await smtp.connect()

        try:
            await smtp.login(self._smtp_user, self._smtp_password)
            await smtp.send_message(mensaje)
            logger.info("[SMTP] Correo enviado exitosamente")
        finally:
            try:
                await smtp.quit()
            except Exception:
                logger.warning("[SMTP] No se pudo cerrar la conexión SMTP", exc_info=True)
