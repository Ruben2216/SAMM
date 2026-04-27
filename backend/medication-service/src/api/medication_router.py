from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo
from src.infrastructure.database import get_db
from src.domain import models, schemas
from src.application.notifier import notificar_familiares

router = APIRouter(prefix="/medicamentos", tags=["Medicamentos"])

TZ_MEXICO = ZoneInfo("America/Mexico_City")
# Tolerancia: después de X minutos de la hora asignada, si no se tomó, es "incumplido"
MINUTOS_TOLERANCIA_INCUMPLIDO = 30


def _calcular_estado_horario(horario: models.Horario, db: Session, ahora: datetime, hoy: date) -> str:
    """Calcula el estado de un horario para HOY: tomado, incumplido, pendiente o no_aplica_hoy."""
    # 1. ¿Hoy aplica según los días de la semana configurados?
    dias_config = (horario.Dias_Semana or "1,2,3,4,5,6,7").split(",")
    try:
        dias_validos = {int(d.strip()) for d in dias_config if d.strip()}
    except ValueError:
        dias_validos = {1, 2, 3, 4, 5, 6, 7}

    if ahora.isoweekday() not in dias_validos:
        return "no_aplica_hoy"

    # 2. ¿Hay un registro cerrado en historial?
    registro = db.query(models.HistorialToma).filter(
        models.HistorialToma.Id_Medicamento == horario.Id_Medicamento,
        models.HistorialToma.Fecha_Asignada == hoy,
        models.HistorialToma.Hora_Asignada == horario.Hora_Toma,
    ).first()

    if registro:
        if registro.Estado == "tomado":
            return "tomado"
        if registro.Estado == "incumplido":
            return "incumplido"

    # 3. Cálculo dinámico: si ya pasaron 30 min de la hora asignada y no hay "tomado", es "incumplido".
    # Esto cubre el gap entre que pasa la hora y el scheduler corre (cada 1 min).
    limite_incumplido = (ahora - timedelta(minutes=MINUTOS_TOLERANCIA_INCUMPLIDO)).time()
    if horario.Hora_Toma <= limite_incumplido:
        return "incumplido"

    return "pendiente"

# 1. CREATE - Registrar un medicamento
@router.post("/", response_model=schemas.MedicamentoResponse)
def registrar_medicamento(medicamento: schemas.MedicamentoCreate, db: Session = Depends(get_db)):
    nuevo_medicamento = models.Medicamento(
        Id_Usuario=medicamento.Id_Usuario,
        Nombre=medicamento.Nombre,
        Dosis=medicamento.Dosis,
        Frecuencia=medicamento.Frecuencia,
        Notas=medicamento.Notas
    )
    db.add(nuevo_medicamento)
    db.commit()
    db.refresh(nuevo_medicamento)

    # Para "según sea necesario" no se registran horarios: se toma a demanda.
    if medicamento.Frecuencia != "necesario":
        for horario in medicamento.horarios:
            nuevo_horario = models.Horario(
                Id_Medicamento=nuevo_medicamento.Id_Medicamento,
                Hora_Toma=horario.Hora_Toma,
                Dias_Semana=horario.Dias_Semana or "1,2,3,4,5,6,7",
            )
            db.add(nuevo_horario)

    db.commit()
    db.refresh(nuevo_medicamento)
    return nuevo_medicamento

# 2. READ - Obtener TODOS los medicamentos de un adulto específico
@router.get("/usuario/{id_usuario}", response_model=list[schemas.MedicamentoResponse])
def obtener_medicamentos_usuario(id_usuario: int, db: Session = Depends(get_db)):
    medicamentos = db.query(models.Medicamento).filter(models.Medicamento.Id_Usuario == id_usuario).all()

    ahora = datetime.now(TZ_MEXICO)
    hoy = ahora.date()

    resultado = []
    for med in medicamentos:
        # Calcula estado por cada horario (pendiente, tomado, incumplido, no_aplica_hoy)
        horarios_con_estado = []
        for h in med.horarios:
            estado = _calcular_estado_horario(h, db, ahora, hoy)
            horarios_con_estado.append({
                "Id_Horario": h.Id_Horario,
                "Hora_Toma": h.Hora_Toma,
                "Dias_Semana": h.Dias_Semana or "1,2,3,4,5,6,7",
                "estado_hoy": estado,
            })

        # tomado_hoy = true sólo si TODOS los horarios aplicables ya fueron tomados
        aplicables = [h for h in horarios_con_estado if h["estado_hoy"] != "no_aplica_hoy"]
        tomado_hoy = len(aplicables) > 0 and all(h["estado_hoy"] == "tomado" for h in aplicables)

        resultado.append({
            "Id_Medicamento": med.Id_Medicamento,
            "Id_Usuario": med.Id_Usuario,
            "Nombre": med.Nombre,
            "Dosis": med.Dosis,
            "Frecuencia": med.Frecuencia,
            "Notas": med.Notas,
            "Activo": med.Activo,
            "horarios": horarios_con_estado,
            "tomado_hoy": tomado_hoy,
        })

    return resultado

# 3. READ - Obtener el detalle de UN solo medicamento
@router.get("/{id_medicamento}", response_model=schemas.MedicamentoResponse)
def obtener_un_medicamento(id_medicamento: int, db: Session = Depends(get_db)):
    medicamento = db.query(models.Medicamento).filter(models.Medicamento.Id_Medicamento == id_medicamento).first()
    if not medicamento:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    return medicamento

# 4. DELETE - Eliminar un medicamento (y sus horarios automáticamente)
@router.delete("/{id_medicamento}")
def eliminar_medicamento(id_medicamento: int, db: Session = Depends(get_db)):
    medicamento = db.query(models.Medicamento).filter(models.Medicamento.Id_Medicamento == id_medicamento).first()
    if not medicamento:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    
    db.delete(medicamento)
    db.commit()
    return {"mensaje": "Medicamento eliminado correctamente"}

# 5. UPDATE - Actualizar un medicamento y sus horarios
@router.put("/{id_medicamento}", response_model=schemas.MedicamentoResponse)
def actualizar_medicamento(id_medicamento: int, medicamento_actualizado: schemas.MedicamentoCreate, db: Session = Depends(get_db)):
    # 1. Buscar si el medicamento existe
    medicamento_db = db.query(models.Medicamento).filter(models.Medicamento.Id_Medicamento == id_medicamento).first()
    
    if not medicamento_db:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    
    # 2. Actualizar los datos principales
    medicamento_db.Nombre = medicamento_actualizado.Nombre
    medicamento_db.Dosis = medicamento_actualizado.Dosis
    medicamento_db.Frecuencia = medicamento_actualizado.Frecuencia
    medicamento_db.Notas = medicamento_actualizado.Notas
    # Nota: No actualizamos el Id_Usuario porque la medicina sigue siendo del mismo adulto
    
    # 3. Eliminar los horarios viejos
    db.query(models.Horario).filter(models.Horario.Id_Medicamento == id_medicamento).delete()

    # 4. Insertar los horarios nuevos (omitimos si la frecuencia es "necesario")
    if medicamento_actualizado.Frecuencia != "necesario":
        for horario in medicamento_actualizado.horarios:
            nuevo_horario = models.Horario(
                Id_Medicamento=id_medicamento,
                Hora_Toma=horario.Hora_Toma,
                Dias_Semana=horario.Dias_Semana or "1,2,3,4,5,6,7",
            )
            db.add(nuevo_horario)
    
    # 5. Guardar los cambios en la base de datos
    db.commit()
    db.refresh(medicamento_db)
    
    return medicamento_db

# 6. ACTION - Marcar un medicamento como TOMADO (con la hora exacta que le tocaba)
@router.post("/{id_medicamento}/tomar")
def marcar_como_tomado(id_medicamento: int, toma: schemas.TomaConfirmar, db: Session = Depends(get_db)):
    ahora = datetime.now(TZ_MEXICO)
    hoy = ahora.date()

    medicamento = db.query(models.Medicamento).filter(models.Medicamento.Id_Medicamento == id_medicamento).first()
    if not medicamento:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")

    # "Según sea necesario" se guarda con estado distinto para poder filtrarlo en el historial.
    # Además nunca debe fusionarse con un registro de scheduler (no tiene hora fija asociada).
    es_necesario = medicamento.Frecuencia == "necesario"

    if es_necesario:
        registro_existente = db.query(models.HistorialToma).filter(
            models.HistorialToma.Id_Medicamento == id_medicamento,
            models.HistorialToma.Fecha_Asignada == hoy,
            models.HistorialToma.Hora_Asignada == toma.hora_asignada,
            models.HistorialToma.Estado == "tomado_necesario",
        ).first()

        if registro_existente:
            return {"mensaje": "La toma ya fue registrada anteriormente."}

        # Se crea una fila nueva por cada toma "según sea necesario".
        registro = models.HistorialToma(
            Id_Medicamento=id_medicamento,
            Fecha_Asignada=hoy,
            Hora_Asignada=toma.hora_asignada,
            Estado="tomado_necesario",
            Fecha_Hora_Real_Toma=ahora,
            Alerta_Enviada_Familiar=False,
        )
        db.add(registro)
    else:
        # Si ya existía un registro (recordatorio_enviado) para esa hora, lo cerramos como tomado
        # en vez de crear uno nuevo (evita duplicados y cierra bien el ciclo).
        registro = db.query(models.HistorialToma).filter(
            models.HistorialToma.Id_Medicamento == id_medicamento,
            models.HistorialToma.Fecha_Asignada == hoy,
            models.HistorialToma.Hora_Asignada == toma.hora_asignada,
        ).first()

        if registro:
            if registro.Estado in ["tomado", "tomado_necesario"]:
                return {"mensaje": "La toma ya fue registrada anteriormente."}

            registro.Estado = "tomado"
            registro.Fecha_Hora_Real_Toma = ahora
        else:
            registro = models.HistorialToma(
                Id_Medicamento=id_medicamento,
                Fecha_Asignada=hoy,
                Hora_Asignada=toma.hora_asignada,
                Estado="tomado",
                Fecha_Hora_Real_Toma=ahora,
                Alerta_Enviada_Familiar=False,
            )
            db.add(registro)
    db.commit()

    # Notificar a los familiares vinculados (via notification-service)
    notificar_familiares(
        id_adulto_mayor=medicamento.Id_Usuario,
        titulo="Medicamento tomado",
        cuerpo=f"Se ha registrado la toma de {medicamento.Nombre}",
        datos={
            "tipo": "alerta_familiar",
            "tipoAlerta": "tomado",
            "nombreMedicamento": medicamento.Nombre,
            "horaToma": toma.hora_asignada.strftime("%H:%M"),
        },
    )

    return {"mensaje": f"El medicamento ha sido registrado como tomado hoy."}

# 7. READ - Obtener el historial de tomas de un usuario
@router.get("/usuario/{id_usuario}/historial", response_model=list[schemas.HistorialTomaResponse])
def obtener_historial_usuario(id_usuario: int, db: Session = Depends(get_db)):
    # Historial = tomas cerradas: tomado, incumplido y tomado_necesario (según sea necesario).
    # Excluimos "recordatorio_enviado" y "pendiente" (señales internas del scheduler).
    resultados = db.query(models.HistorialToma, models.Medicamento)\
        .join(models.Medicamento, models.HistorialToma.Id_Medicamento == models.Medicamento.Id_Medicamento)\
        .filter(models.Medicamento.Id_Usuario == id_usuario)\
        .filter(models.HistorialToma.Estado.in_(["tomado", "incumplido", "tomado_necesario"]))\
        .order_by(models.HistorialToma.Fecha_Asignada.desc(), models.HistorialToma.Hora_Asignada.desc())\
        .all()
    
    historial_formateado = []
    for toma, med in resultados:
        historial_formateado.append({
            "Id_Historial": toma.Id_Historial,
            "Id_Medicamento": toma.Id_Medicamento,
            "Nombre_Medicamento": med.Nombre,
            "Dosis": med.Dosis,
            "Frecuencia": med.Frecuencia,
            "Fecha_Asignada": toma.Fecha_Asignada,
            "Hora_Asignada": toma.Hora_Asignada,
            "Estado": toma.Estado,
            "Notas": med.Notas
        })
    
    return historial_formateado