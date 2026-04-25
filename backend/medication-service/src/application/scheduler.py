import logging
from datetime import datetime, timedelta, time as dtime
from zoneinfo import ZoneInfo
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from src.infrastructure.database import SessionLocal
from src.domain import models
from src.application.notifier import notificar_familiares

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TZ_MEXICO = ZoneInfo("America/Mexico_City")


def _horario_aplica_hoy(horario, iso_hoy: int) -> bool:
    """True si hoy (1=Lun..7=Dom) está en los Dias_Semana del horario."""
    dias = (horario.Dias_Semana or "1,2,3,4,5,6,7").split(",")
    try:
        return iso_hoy in {int(d.strip()) for d in dias if d.strip()}
    except ValueError:
        return True


def recordar_a_familiares():
    """
    Cada minuto: si la hora actual coincide con la Hora_Toma de algún horario activo,
    notifica a los familiares del adulto. Dedupe con HistorialToma(Estado='recordatorio_enviado').
    """
    db: Session = SessionLocal()
    try:
        ahora = datetime.now(TZ_MEXICO)
        hoy = ahora.date()
        iso_hoy = ahora.isoweekday()
        hora_actual = ahora.time().replace(second=0, microsecond=0)

        horarios = db.query(models.Horario).join(models.Medicamento).filter(
            models.Medicamento.Activo == True
        ).all()

        for horario in horarios:
            if not _horario_aplica_hoy(horario, iso_hoy):
                continue

            hora_toma_min = horario.Hora_Toma.replace(second=0, microsecond=0) \
                if isinstance(horario.Hora_Toma, dtime) else horario.Hora_Toma

            if hora_toma_min != hora_actual:
                continue

            # Dedupe: si ya hay cualquier registro para esa toma hoy, no volver a notificar
            registro = db.query(models.HistorialToma).filter(
                models.HistorialToma.Id_Medicamento == horario.Id_Medicamento,
                models.HistorialToma.Fecha_Asignada == hoy,
                models.HistorialToma.Hora_Asignada == horario.Hora_Toma,
            ).first()

            if registro:
                continue

            # Crea marca de recordatorio enviado para no duplicar
            marca = models.HistorialToma(
                Id_Medicamento=horario.Id_Medicamento,
                Fecha_Asignada=hoy,
                Hora_Asignada=horario.Hora_Toma,
                Estado="recordatorio_enviado",
                Fecha_Hora_Real_Toma=None,
                Alerta_Enviada_Familiar=True,
            )
            db.add(marca)
            db.commit()

            nombre_med = horario.medicamento.Nombre
            hora_str = horario.Hora_Toma.strftime("%H:%M")

            # El notification-service rellena {nombreAdulto} en titulo/cuerpo
            notificar_familiares(
                id_adulto_mayor=horario.medicamento.Id_Usuario,
                titulo="Hora del medicamento",
                cuerpo=f"{{nombreAdulto}} debe tomar {nombre_med} ({hora_str})",
                datos={
                    "tipo": "recordatorio_familiar",
                    "nombreMedicamento": nombre_med,
                    "horaToma": hora_str,
                },
            )
            logger.info(f"[Recordatorio] Familiares notificados: med {nombre_med} @ {hora_str}")

    except Exception as e:
        logger.error(f"Error en recordar_a_familiares: {e}")
        db.rollback()
    finally:
        db.close()


def verificar_incumplimientos():
    db: Session = SessionLocal()
    try:
        ahora = datetime.now(TZ_MEXICO)
        hoy = ahora.date()
        iso_hoy = ahora.isoweekday()

        # 30 minutos de tolerancia
        limite_tiempo = (ahora - timedelta(minutes=30)).time()

        horarios = db.query(models.Horario).join(models.Medicamento).filter(
            models.Medicamento.Activo == True
        ).all()

        for horario in horarios:
            if not _horario_aplica_hoy(horario, iso_hoy):
                continue

            if horario.Hora_Toma > limite_tiempo:
                continue

            # Busca si ya se marcó como tomado o ya se marcó como incumplido
            registro_cerrado = db.query(models.HistorialToma).filter(
                models.HistorialToma.Id_Medicamento == horario.Id_Medicamento,
                models.HistorialToma.Fecha_Asignada == hoy,
                models.HistorialToma.Hora_Asignada == horario.Hora_Toma,
                models.HistorialToma.Estado.in_(["tomado", "incumplido"]),
            ).first()

            if registro_cerrado:
                continue

            logger.warning(f"¡ALERTA! Se olvidó la medicina ID {horario.Id_Medicamento} de las {horario.Hora_Toma}")

            # Si hay un registro previo de 'recordatorio_enviado', actualízalo; si no, crea uno nuevo
            registro_previo = db.query(models.HistorialToma).filter(
                models.HistorialToma.Id_Medicamento == horario.Id_Medicamento,
                models.HistorialToma.Fecha_Asignada == hoy,
                models.HistorialToma.Hora_Asignada == horario.Hora_Toma,
            ).first()

            if registro_previo:
                registro_previo.Estado = "incumplido"
                registro_previo.Alerta_Enviada_Familiar = True
            else:
                db.add(models.HistorialToma(
                    Id_Medicamento=horario.Id_Medicamento,
                    Fecha_Asignada=hoy,
                    Hora_Asignada=horario.Hora_Toma,
                    Estado="incumplido",
                    Fecha_Hora_Real_Toma=None,
                    Alerta_Enviada_Familiar=True,
                ))
            db.commit()

            notificar_familiares(
                id_adulto_mayor=horario.medicamento.Id_Usuario,
                titulo="Medicación olvidada",
                cuerpo=f"{{nombreAdulto}} no tomó {horario.medicamento.Nombre} de las {horario.Hora_Toma.strftime('%H:%M')}",
                datos={
                    "tipo": "alerta_familiar",
                    "tipoAlerta": "olvidado",
                    "nombreMedicamento": horario.medicamento.Nombre,
                    "horaToma": horario.Hora_Toma.strftime("%H:%M"),
                },
            )

    except Exception as e:
        logger.error(f"Error en verificar_incumplimientos: {e}")
        db.rollback()
    finally:
        db.close()


def iniciar_scheduler():
    scheduler = BackgroundScheduler(timezone=TZ_MEXICO)
    scheduler.add_job(recordar_a_familiares, 'interval', minutes=1, id='recordar_familiares')
    scheduler.add_job(verificar_incumplimientos, 'interval', minutes=1, id='verificar_incumplimientos')
    scheduler.start()
    logger.info("Cron Jobs iniciados (recordar_familiares + verificar_incumplimientos). TZ: America/Mexico_City.")