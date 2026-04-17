import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from src.infrastructure.database import SessionLocal
from src.domain import models
from src.application.notifier import notificar_familiares

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuración de la Zona Horaria de México
TZ_MEXICO = ZoneInfo("America/Mexico_City")

def verificar_incumplimientos():
    db: Session = SessionLocal()
    try:
        ahora = datetime.now(TZ_MEXICO)
        hoy = ahora.date()
        
        # Damos 30 minutos de "tolerancia" para que se tome la pastilla
        limite_tiempo = (ahora - timedelta(minutes=30)).time()
        
        # Traemos todos los horarios de los medicamentos activos
        horarios = db.query(models.Horario).join(models.Medicamento).filter(models.Medicamento.Activo == True).all()

        for horario in horarios:
            # Validamos: Si la hora de la pastilla ya pasó su límite de tolerancia
            if horario.Hora_Toma <= limite_tiempo:
                
                # Se busca si hay un registro de que SE LA TOMÓ a esa hora exacta
                registro = db.query(models.HistorialToma).filter(
                    models.HistorialToma.Id_Medicamento == horario.Id_Medicamento,
                    models.HistorialToma.Fecha_Asignada == hoy,
                    models.HistorialToma.Hora_Asignada == horario.Hora_Toma
                ).first()

                # Si NO hay registro, significa que se le olvidó por completo
                if not registro:
                    logger.warning(f"¡ALERTA! Se olvidó la medicina ID {horario.Id_Medicamento} de las {horario.Hora_Toma}")

                    nuevo_incumplimiento = models.HistorialToma(
                        Id_Medicamento=horario.Id_Medicamento,
                        Fecha_Asignada=hoy,
                        Hora_Asignada=horario.Hora_Toma,
                        Estado="incumplido",
                        Fecha_Hora_Real_Toma=None,
                        Alerta_Enviada_Familiar=True
                    )
                    db.add(nuevo_incumplimiento)
                    db.commit()

                    # Notificar a los familiares via notification-service
                    notificar_familiares(
                        id_adulto_mayor=horario.medicamento.Id_Usuario,
                        titulo="Medicación olvidada",
                        cuerpo=f"No se registró la toma de {horario.medicamento.Nombre}",
                        datos={
                            "tipo": "alerta_familiar",
                            "tipoAlerta": "olvidado",
                            "nombreMedicamento": horario.medicamento.Nombre,
                            "horaToma": horario.Hora_Toma.strftime("%H:%M"),
                        },
                    )
                    
    except Exception as e:
        logger.error(f"Error en Cron Job: {e}")
    finally:
        db.close()

def iniciar_scheduler():
    scheduler = BackgroundScheduler(timezone=TZ_MEXICO)
    # Se ejecutará cada 1 minuto para monitorear (por ahora para las pruebas)
    scheduler.add_job(verificar_incumplimientos, 'interval', minutes=1)
    scheduler.start()
    logger.info("Cron Job iniciado. Zona horaria: America/Mexico_City.")