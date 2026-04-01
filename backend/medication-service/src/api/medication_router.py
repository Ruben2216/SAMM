from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.infrastructure.database import get_db
from src.domain import models, schemas

# Creamos el enrutador
router = APIRouter(prefix="/medicamentos", tags=["Medicamentos"])

# 1. CREATE - Registrar un medicamento
@router.post("/", response_model=schemas.MedicamentoResponse)
def registrar_medicamento(medicamento: schemas.MedicamentoCreate, db: Session = Depends(get_db)):
    nuevo_medicamento = models.Medicamento(
        Id_Usuario=medicamento.Id_Usuario,
        Nombre=medicamento.Nombre,
        Dosis=medicamento.Dosis,
        Frecuencia=medicamento.Frecuencia
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