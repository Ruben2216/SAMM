import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from src.infrastructure.database import SessionLocal
from src.domain.models import Cita
from src.application.notifier import notificar_familiares

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TZ_MEXICO = ZoneInfo("America/Mexico_City")

def verificar_citas_proximas():
    db: Session = SessionLocal()
    try:
        ahora = datetime.now(TZ_MEXICO)
        
        inicio_24h = ahora + timedelta(hours=23, minutes=59)
        fin_24h = ahora + timedelta(hours=24)

        citas = db.query(Cita).filter(Cita.estado == 'programada').all()

        for cita in citas:
            fecha_cita = cita.fecha_hora
            if isinstance(fecha_cita, str):
                fecha_cita = datetime.fromisoformat(fecha_cita.replace('Z', '+00:00'))
            
            if fecha_cita.tzinfo is None:
                fecha_cita = fecha_cita.replace(tzinfo=TZ_MEXICO)
            else:
                fecha_cita = fecha_cita.astimezone(TZ_MEXICO)

            mensaje_extra = f" Recuerda llevar: {cita.notas}" if cita.notas else ""
            
            if inicio_24h <= fecha_cita <= fin_24h:
                enviar_alerta_push(cita, "Mañana", mensaje_extra)

    except Exception as e:
        logger.error(f"Error en verificar_citas_proximas: {e}")
    finally:
        db.close()

def enviar_alerta_push(cita, tiempo_aviso, mensaje_extra):
    """
    Usa el notifier para mandar la push usando la misma estructura que medication-service.
    """
    cuerpo_mensaje = f"{{nombreAdulto}} tiene una cita médica {tiempo_aviso}.{mensaje_extra}"
    
    notificar_familiares(
        id_adulto_mayor=cita.id_usuario,
        titulo=f"Cita: {cita.especialidad}",
        cuerpo=cuerpo_mensaje,
        datos={
            "tipo": "recordatorio_cita",
            "especialidad": cita.especialidad,
            "tiempoAviso": tiempo_aviso
        }
    )
    logger.info(f"[Recordatorio] Push enviada: Cita de {cita.especialidad} para usuario {cita.id_usuario}")

def actualizar_estados_vencidos():

    db: Session = SessionLocal()
    try:
        ahora = datetime.now(TZ_MEXICO)
        citas = db.query(Cita).filter(Cita.estado == 'programada').all()
        modificadas = False

        for cita in citas:
            fecha_cita = cita.fecha_hora

            if isinstance(fecha_cita, str):
                fecha_cita = datetime.fromisoformat(fecha_cita.replace('Z', '+00:00'))
            
            if fecha_cita.tzinfo is None:
                fecha_cita = fecha_cita.replace(tzinfo=TZ_MEXICO)
            else:
                fecha_cita = fecha_cita.astimezone(TZ_MEXICO)
            
            if fecha_cita <= ahora:
                cita.estado = 'completada'
                modificadas = True
    
        if modificadas:
            db.commit()
            logger.info("Cita marcada como completada en la base de datos")
    
    except Exception as e:
        logger.error("Error al guardar el estado de la cita")
        db.rollback()
    finally:
        db.close()

def iniciar_scheduler():
    scheduler = BackgroundScheduler(timezone=TZ_MEXICO)
    scheduler.add_job(actualizar_estados_vencidos, 'interval', minutes=2, id='limpiar_estados')
    scheduler.add_job(verificar_citas_proximas, 'interval', minutes=1, id='enviar_notificaciones')
    scheduler.start()
    logger.info("Cron Job de Citas iniciado. TZ: America/Mexico_City.")