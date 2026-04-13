from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.domain import models, schemas
from src.infrastructure.database import get_db

router = APIRouter(prefix="/api/citas", tags=["Citas"])

@router.post("/", response_model=schemas.CitaResponse)
def crear_cita(cita: schemas.CitaCreate, db: Session = Depends(get_db)):
    nueva_cita = models.Cita(**cita.model_dump())
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    return nueva_cita

@router.get("/usuario/{id_usuario}", response_model=List[schemas.CitaResponse])
def obtener_citas(id_usuario: int, db: Session = Depends(get_db)):
    return db.query(models.Cita).filter(models.Cita.id_usuario == id_usuario).all()

@router.put("/{cita_id}", response_model=schemas.CitaResponse)
def actualizar_cita(cita_id: int, cita_actualizada: schemas.CitaUpdate, db: Session = Depends(get_db)):
    cita_db = db.query(models.Cita).filter(models.Cita.id == cita_id).first()
    if not cita_db: raise HTTPException(status_code=404, detail="Cita no encontrada")
    for key, value in cita_actualizada.model_dump(exclude_unset=True).items():
        setattr(cita_db, key, value)
    db.commit()
    db.refresh(cita_db)
    return cita_db

@router.delete("/{cita_id}")
def eliminar_cita(cita_id: int, db: Session = Depends(get_db)):
    cita_db = db.query(models.Cita).filter(models.Cita.id == cita_id).first()
    if not cita_db: raise HTTPException(status_code=404, detail="Cita no encontrada")
    db.delete(cita_db)
    db.commit()
    return {"mensaje": "Cita eliminada"}