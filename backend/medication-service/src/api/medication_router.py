from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date
from src.infrastructure.database import get_db
from src.domain import models, schemas
from src.application.notifier import notificar_familiares
from zoneinfo import ZoneInfo

router = APIRouter(prefix="/medicamentos", tags=["Medicamentos"])

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

    for horario in medicamento.horarios:
        nuevo_horario = models.Horario(
            Id_Medicamento=nuevo_medicamento.Id_Medicamento,
            Hora_Toma=horario.Hora_Toma
        )
        db.add(nuevo_horario)
    
    db.commit()
    db.refresh(nuevo_medicamento)
    return nuevo_medicamento

# 2. READ - Obtener TODOS los medicamentos de un adulto específico
@router.get("/usuario/{id_usuario}", response_model=list[schemas.MedicamentoResponse])
def obtener_medicamentos_usuario(id_usuario: int, db: Session = Depends(get_db)):
    medicamentos = db.query(models.Medicamento).filter(models.Medicamento.Id_Usuario == id_usuario).all()
    
    hoy = date.today()
    
    for med in medicamentos:
        # Buscamos si existe al menos una toma registrada para este medicamento en el día de hoy
        toma_hoy = db.query(models.HistorialToma).filter(
            models.HistorialToma.Id_Medicamento == med.Id_Medicamento,
            models.HistorialToma.Fecha_Asignada == hoy,
            models.HistorialToma.Estado == "tomado"
        ).first()
        
        # Si existe una toma hoy, marcamos el medicamento como tomado_hoy = True, sino queda False
        med.tomado_hoy = True if toma_hoy else False
        
    return medicamentos

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
    
    # 4. Insertar los horarios nuevos
    for horario in medicamento_actualizado.horarios:
        nuevo_horario = models.Horario(
            Id_Medicamento=id_medicamento,
            Hora_Toma=horario.Hora_Toma
        )
        db.add(nuevo_horario)
    
    # 5. Guardar los cambios en la base de datos
    db.commit()
    db.refresh(medicamento_db)
    
    return medicamento_db

# 6. ACTION - Marcar un medicamento como TOMADO (con la hora exacta que le tocaba)
@router.post("/{id_medicamento}/tomar")
def marcar_como_tomado(id_medicamento: int, toma: schemas.TomaConfirmar, db: Session = Depends(get_db)):
    tz_mexico = ZoneInfo("America/Mexico_City")
    ahora = datetime.now(tz_mexico)
    hoy = ahora.date()
    
    medicamento = db.query(models.Medicamento).filter(models.Medicamento.Id_Medicamento == id_medicamento).first()
    if not medicamento:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")

    # Registramos la toma con la hora EXACTA que le tocaba y horario de México
    nueva_toma = models.HistorialToma(
        Id_Medicamento=id_medicamento,
        Fecha_Asignada=hoy,
        Hora_Asignada=toma.hora_asignada,
        Estado="tomado",
        Fecha_Hora_Real_Toma=ahora, 
        Alerta_Enviada_Familiar=False
    )
    
    db.add(nueva_toma)
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
    # Traemos el historial uniéndolo con el medicamento para tener el nombre y la dosis
    resultados = db.query(models.HistorialToma, models.Medicamento)\
        .join(models.Medicamento, models.HistorialToma.Id_Medicamento == models.Medicamento.Id_Medicamento)\
        .filter(models.Medicamento.Id_Usuario == id_usuario)\
        .order_by(models.HistorialToma.Fecha_Asignada.desc(), models.HistorialToma.Hora_Asignada.desc())\
        .all()
    
    historial_formateado = []
    for toma, med in resultados:
        historial_formateado.append({
            "Id_Historial": toma.Id_Historial,
            "Id_Medicamento": toma.Id_Medicamento,
            "Nombre_Medicamento": med.Nombre,
            "Dosis": med.Dosis,
            "Fecha_Asignada": toma.Fecha_Asignada,
            "Hora_Asignada": toma.Hora_Asignada,
            "Estado": toma.Estado,
            "Notas": med.Notas
        })
    
    return historial_formateado